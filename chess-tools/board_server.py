#!/usr/bin/env python3
"""
Chess Study Board Server

Serves the interactive web study board and provides a JSON API
for PGN file listing, loading, and optional live Stockfish analysis.

Usage:
    python3 board_server.py [--port 8080] [--no-engine]
"""

import argparse
import http.server
import json
import os
import sys
import urllib.parse
import webbrowser
from pathlib import Path

import chess
import chess.pgn
import io
import re

SCRIPT_DIR = Path(__file__).parent.resolve()
WEB_DIR = SCRIPT_DIR / "web"
PGN_DIR = SCRIPT_DIR  # PGN files live in chess-tools root


class BoardRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler serving static files and a JSON API."""

    engine = None
    engine_enabled = True
    lichess_explorer = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/pgn/list":
            self._handle_pgn_list()
        elif path == "/api/pgn/load":
            params = urllib.parse.parse_qs(parsed.query)
            filename = params.get("file", [None])[0]
            self._handle_pgn_load(filename)
        elif path == "/api/lichess/moves":
            params = urllib.parse.parse_qs(parsed.query)
            self._handle_lichess_moves(params)
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len) if content_len > 0 else b"{}"
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._json_error(400, "Invalid JSON")
            return

        if parsed.path == "/api/analyze":
            self._handle_analyze(data)
        elif parsed.path == "/api/play":
            self._handle_play(data)
        elif parsed.path == "/api/drill/positions":
            self._handle_drill_positions(data)
        elif parsed.path == "/api/pgn/save":
            self._handle_pgn_save(data)
        else:
            self._json_error(404, "Not found")

    def _handle_pgn_list(self):
        """List all .pgn files in chess-tools directory."""
        files = []
        for f in sorted(PGN_DIR.glob("*.pgn")):
            size = f.stat().st_size
            files.append({
                "name": f.name,
                "size": size,
                "size_human": f"{size / 1024:.1f} KB" if size > 1024 else f"{size} B",
            })
        self._json_response({"files": files})

    def _handle_pgn_load(self, filename):
        """Load a PGN file's contents."""
        if not filename:
            self._json_error(400, "Missing 'file' parameter")
            return

        # Security: prevent path traversal
        safe_name = Path(filename).name
        filepath = PGN_DIR / safe_name

        if not filepath.exists() or not filepath.suffix == ".pgn":
            self._json_error(404, f"PGN file not found: {safe_name}")
            return

        content = filepath.read_text(encoding="utf-8", errors="replace")
        self._json_response({"filename": safe_name, "content": content})

    def _handle_analyze(self, data):
        """Run Stockfish analysis on a FEN position."""
        if not self.__class__.engine_enabled:
            self._json_error(503, "Engine disabled (started with --no-engine)")
            return

        fen = data.get("fen")
        if not fen:
            self._json_error(400, "Missing 'fen' field")
            return

        depth = min(data.get("depth", 20), 30)

        try:
            board = chess.Board(fen)
        except ValueError as e:
            self._json_error(400, f"Invalid FEN: {e}")
            return

        if not self._ensure_engine(depth):
            self._json_error(500, "Engine init failed")
            return

        self.__class__.engine.depth = depth
        result = self.__class__.engine.evaluate(board)
        self._json_response(result)

    def _ensure_engine(self, depth=20):
        """Lazy-init Stockfish engine. Returns True on success."""
        if self.__class__.engine is not None:
            return True
        if not self.__class__.engine_enabled:
            return False
        try:
            from engine_analysis import StockfishAnalyzer
            from config import DEFAULTS
            self.__class__.engine = StockfishAnalyzer(
                stockfish_path=DEFAULTS["stockfish_path"],
                depth=depth,
                threads=DEFAULTS.get("stockfish_threads", 2),
            )
            return True
        except Exception:
            return False

    def _handle_play(self, data):
        """Engine plays a move in response to a position."""
        if not self.__class__.engine_enabled:
            self._json_error(503, "Engine disabled")
            return

        fen = data.get("fen")
        if not fen:
            self._json_error(400, "Missing 'fen' field")
            return

        depth = min(data.get("depth", 12), 30)

        try:
            board = chess.Board(fen)
        except ValueError as e:
            self._json_error(400, f"Invalid FEN: {e}")
            return

        if board.is_game_over():
            self._json_response({
                "move": None,
                "fen_after": fen,
                "is_checkmate": board.is_checkmate(),
                "is_stalemate": board.is_stalemate(),
                "is_game_over": True,
                "eval_str": "1-0" if board.is_checkmate() and not board.turn else "0-1",
            })
            return

        if not self._ensure_engine(depth):
            self._json_error(500, "Engine init failed")
            return

        self.__class__.engine.depth = depth
        result = self.__class__.engine.evaluate(board)

        best_move_san = result.get("best_move")
        if not best_move_san:
            self._json_error(500, "Engine returned no move")
            return

        # Play the engine's move
        move = board.parse_san(best_move_san)
        board.push(move)

        self._json_response({
            "move": best_move_san,
            "fen_after": board.fen(),
            "eval_str": result["eval_str"],
            "score_cp": result["score_cp"],
            "mate_in": result["mate_in"],
            "is_checkmate": board.is_checkmate(),
            "is_stalemate": board.is_stalemate(),
            "is_game_over": board.is_game_over(),
        })

    def _handle_drill_positions(self, data):
        """Extract mistake positions from an annotated PGN for drill mode."""
        filename = data.get("file")
        if not filename:
            self._json_error(400, "Missing 'file' field")
            return

        safe_name = Path(filename).name
        filepath = PGN_DIR / safe_name

        if not filepath.exists() or filepath.suffix != ".pgn":
            self._json_error(404, f"PGN not found: {safe_name}")
            return

        content = filepath.read_text(encoding="utf-8", errors="replace")
        positions = []

        pgn_io = io.StringIO(content)
        while True:
            game = chess.pgn.read_game(pgn_io)
            if game is None:
                break

            board = game.board()
            for node in game.mainline():
                comment = node.comment or ""
                # Check if this move was a mistake
                category = None
                if "Blunder!" in comment:
                    category = "blunder"
                elif "Mistake!" in comment:
                    category = "mistake"
                elif "Inaccuracy!" in comment:
                    category = "inaccuracy"

                if category:
                    # Extract best move from comment
                    best_match = re.search(r"Best was (\S+)", comment)
                    best_move = best_match.group(1) if best_match else None

                    # Extract evals from comment
                    eval_match = re.search(r"\(([\+\-\d\.]+)\s*->\s*([\+\-\d\.]+)\)", comment)
                    eval_before = eval_match.group(1) if eval_match else None
                    eval_after = eval_match.group(2) if eval_match else None

                    positions.append({
                        "fen": board.fen(),
                        "played_move": board.san(node.move),
                        "best_move": best_move,
                        "category": category,
                        "eval_before": eval_before,
                        "eval_after": eval_after,
                        "side": "white" if board.turn == chess.WHITE else "black",
                    })

                board.push(node.move)

        self._json_response({"positions": positions, "count": len(positions)})

    def _handle_lichess_moves(self, params):
        """Query Lichess opening explorer for a position."""
        fen = params.get("fen", [None])[0]
        if not fen:
            self._json_error(400, "Missing 'fen' parameter")
            return

        source = params.get("source", ["player"])[0]
        ratings_str = params.get("ratings", ["1600,1800,2000"])[0]
        ratings = [int(r) for r in ratings_str.split(",") if r.strip().isdigit()]

        # Lazy-init Lichess explorer
        if self.__class__.lichess_explorer is None:
            try:
                from lichess_api import LichessExplorer
                self.__class__.lichess_explorer = LichessExplorer(api_delay=1.0)
            except Exception as e:
                self._json_error(500, f"Lichess init failed: {e}")
                return

        try:
            if source == "masters":
                result = self.__class__.lichess_explorer.get_masters_moves(fen)
            else:
                result = self.__class__.lichess_explorer.get_lichess_moves(
                    fen, ratings=ratings, speeds=["rapid", "classical"]
                )
            self._json_response(result)
        except Exception as e:
            self._json_error(500, f"Lichess API error: {e}")

    def _handle_pgn_save(self, data):
        """Save a PGN string to a file."""
        filename = data.get("filename")
        content = data.get("content")
        if not filename or not content:
            self._json_error(400, "Missing 'filename' or 'content'")
            return

        safe_name = Path(filename).name
        if not safe_name.endswith(".pgn"):
            safe_name += ".pgn"

        filepath = PGN_DIR / safe_name
        filepath.write_text(content, encoding="utf-8")
        self._json_response({"saved": safe_name})

    def _json_response(self, data, status=200):
        """Send a JSON response."""
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(body))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _json_error(self, status, message):
        """Send a JSON error response."""
        self._json_response({"error": message}, status)

    def log_message(self, format, *args):
        """Quieter logging — skip static file requests."""
        path = args[0] if args else ""
        if isinstance(path, str) and path.startswith("GET /api/"):
            super().log_message(format, *args)
        elif isinstance(path, str) and path.startswith("POST"):
            super().log_message(format, *args)


def main():
    parser = argparse.ArgumentParser(description="Chess Study Board Server")
    parser.add_argument("--port", type=int, default=8080, help="Port (default: 8080)")
    parser.add_argument("--no-engine", action="store_true", help="Disable Stockfish analysis")
    parser.add_argument("--no-open", action="store_true", help="Don't auto-open browser")
    parser.add_argument("--pgn", "--open", metavar="FILE", dest="open", help="Auto-load this PGN file")
    args = parser.parse_args()

    BoardRequestHandler.engine_enabled = not args.no_engine

    server = http.server.HTTPServer(("127.0.0.1", args.port), BoardRequestHandler)

    url = f"http://localhost:{args.port}"
    if args.open:
        url += f"?pgn={urllib.parse.quote(args.open)}"

    print(f"\n  Chess Study Board")
    print(f"  =================")
    print(f"  Board:    {url}")
    print(f"  Engine:   {'enabled' if not args.no_engine else 'disabled'}")
    print(f"  PGN dir:  {PGN_DIR}")
    print(f"\n  Press Ctrl+C to stop.\n")

    if not args.no_open:
        webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Shutting down...")
        if BoardRequestHandler.engine:
            BoardRequestHandler.engine.quit()
        server.shutdown()


if __name__ == "__main__":
    main()
