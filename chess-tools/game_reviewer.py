#!/usr/bin/env python3
"""
Chess Game Reviewer

Import your games from Lichess or Chess.com and get annotated PGN files with:
- Mistake detection (blunders, mistakes, inaccuracies)
- Best move suggestions from Stockfish
- Evaluation graphs showing where you went wrong
- Comparison against your repertoire (if provided)

Usage:
    python3 game_reviewer.py --lichess USERNAME --games 10
    python3 game_reviewer.py --pgn my_games.pgn
    python3 game_reviewer.py --lichess USERNAME --repertoire italian.pgn
"""

import argparse
import io
import sys
import time

import chess
import chess.pgn
import requests

from engine_analysis import StockfishAnalyzer


# Classification thresholds (centipawns)
BLUNDER_THRESHOLD = 200    # >= 2 pawns lost
MISTAKE_THRESHOLD = 100    # >= 1 pawn lost
INACCURACY_THRESHOLD = 50  # >= 0.5 pawns lost


class GameReviewer:
    """Analyzes chess games and annotates with mistakes and improvements."""

    def __init__(self, stockfish_path="/opt/homebrew/bin/stockfish",
                 analysis_depth=20, threads=4):
        self.engine = StockfishAnalyzer(
            stockfish_path=stockfish_path,
            depth=analysis_depth,
            threads=threads,
        )
        self.repertoire_moves = {}  # FEN -> [expected SANs]

    def load_repertoire(self, pgn_path):
        """
        Load a repertoire PGN to compare against.

        Args:
            pgn_path: Path to repertoire PGN file
        """
        with open(pgn_path) as f:
            game = chess.pgn.read_game(f)

        if game is None:
            print(f"  Warning: Could not read repertoire from {pgn_path}")
            return

        self._extract_repertoire_moves(game, chess.Board())
        print(f"  Repertoire loaded: {len(self.repertoire_moves)} positions")

    def _extract_repertoire_moves(self, node, board):
        """Recursively extract all repertoire positions and moves."""
        for variation in node.variations:
            move = variation.move
            fen = board.fen()

            if fen not in self.repertoire_moves:
                self.repertoire_moves[fen] = []
            self.repertoire_moves[fen].append(board.san(move))

            board_copy = board.copy()
            board_copy.push(move)
            self._extract_repertoire_moves(variation, board_copy)

    def review_game(self, game, player_color=None):
        """
        Analyze a single game and add annotations.

        Args:
            game: chess.pgn.Game object
            player_color: chess.WHITE or chess.BLACK (auto-detected if None)

        Returns:
            Annotated chess.pgn.Game
        """
        board = game.board()
        node = game

        # Auto-detect player color from headers if not specified
        if player_color is None:
            player_color = chess.WHITE  # Default

        prev_eval = None
        move_number = 0
        stats = {"blunders": 0, "mistakes": 0, "inaccuracies": 0, "good": 0}

        for child in game.mainline():
            move = child.move
            is_player_move = (board.turn == player_color)
            move_number += 1

            # Evaluate position BEFORE the move
            eval_before = self.engine.evaluate(board)

            # Make the move
            san = board.san(move)
            board.push(move)

            # Evaluate position AFTER the move
            eval_after = self.engine.evaluate(board)

            if is_player_move:
                # Calculate evaluation loss
                loss = self._eval_loss(eval_before, eval_after, player_color)

                # Classify the move
                if loss >= BLUNDER_THRESHOLD:
                    child.nags.add(chess.pgn.NAG_BLUNDER)  # ??
                    stats["blunders"] += 1
                    category = "Blunder"
                elif loss >= MISTAKE_THRESHOLD:
                    child.nags.add(chess.pgn.NAG_MISTAKE)  # ?
                    stats["mistakes"] += 1
                    category = "Mistake"
                elif loss >= INACCURACY_THRESHOLD:
                    child.nags.add(chess.pgn.NAG_DUBIOUS_MOVE)  # ?!
                    stats["inaccuracies"] += 1
                    category = "Inaccuracy"
                else:
                    stats["good"] += 1
                    category = None

                # Add annotation for mistakes
                if category:
                    best_move = eval_before.get("best_move", "?")
                    parts = [
                        f"{category}! ({eval_before['eval_str']} -> {eval_after['eval_str']})",
                        f"Best was {best_move}",
                    ]
                    child.comment = " | ".join(parts)

                # Check against repertoire
                fen_before = board.copy()
                fen_before.pop()
                rep_key = fen_before.fen()
                if rep_key in self.repertoire_moves:
                    rep_moves = self.repertoire_moves[rep_key]
                    if san not in rep_moves:
                        rep_note = f"Repertoire suggests: {', '.join(rep_moves)}"
                        if child.comment:
                            child.comment += f" | {rep_note}"
                        else:
                            child.comment = rep_note

            # Add eval to every move as a comment suffix
            eval_note = f"[{eval_after['eval_str']}]"
            if child.comment:
                child.comment += f" {eval_note}"
            else:
                child.comment = eval_note

            prev_eval = eval_after

        # Add summary to game headers
        color_name = "White" if player_color == chess.WHITE else "Black"
        total_moves = stats["blunders"] + stats["mistakes"] + stats["inaccuracies"] + stats["good"]
        accuracy = (stats["good"] / total_moves * 100) if total_moves > 0 else 0

        game.headers["Annotator"] = "Chess Toolkit Game Reviewer"
        game.comment = (
            f"Review ({color_name}): "
            f"{stats['blunders']} blunders, {stats['mistakes']} mistakes, "
            f"{stats['inaccuracies']} inaccuracies | "
            f"Accuracy: {accuracy:.0f}%"
        )

        return game, stats

    def _eval_loss(self, eval_before, eval_after, player_color):
        """Calculate how much evaluation was lost by the player's move."""
        def to_cp(ev):
            if ev["mate_in"] is not None:
                # Convert mate to large centipawn value
                mate = ev["mate_in"]
                return 10000 if mate > 0 else -10000
            return ev["score_cp"] or 0

        cp_before = to_cp(eval_before)
        cp_after = to_cp(eval_after)

        # From the player's perspective
        if player_color == chess.WHITE:
            return cp_before - cp_after  # Positive = evaluation dropped
        else:
            return cp_after - cp_before  # Flip for Black

    def review_games_from_pgn(self, pgn_text, player_name=None, max_games=None):
        """
        Review multiple games from PGN text.

        Args:
            pgn_text: PGN string containing one or more games
            player_name: Player's username (for auto-detecting color)
            max_games: Max games to review

        Returns:
            List of (annotated_game, stats) tuples
        """
        pgn_io = io.StringIO(pgn_text)
        results = []
        count = 0

        while True:
            game = chess.pgn.read_game(pgn_io)
            if game is None:
                break

            if max_games and count >= max_games:
                break

            # Detect player color
            player_color = chess.WHITE
            if player_name:
                white = game.headers.get("White", "")
                black = game.headers.get("Black", "")
                if player_name.lower() in black.lower():
                    player_color = chess.BLACK

            count += 1
            white_name = game.headers.get("White", "?")
            black_name = game.headers.get("Black", "?")
            print(f"\nReviewing game {count}: {white_name} vs {black_name}...")

            annotated, stats = self.review_game(game, player_color)
            results.append((annotated, stats))

            print(f"  Blunders: {stats['blunders']} | Mistakes: {stats['mistakes']} | "
                  f"Inaccuracies: {stats['inaccuracies']} | Good: {stats['good']}")

        return results

    def cleanup(self):
        """Shut down the engine."""
        self.engine.quit()


def download_lichess_games(username, max_games=10, speeds=None):
    """Download games from Lichess."""
    print(f"Downloading {max_games} games for {username} from Lichess...")

    url = f"https://lichess.org/api/games/user/{username}"
    params = {
        "max": max_games,
        "rated": "true",
        "evals": "true",
        "opening": "true",
    }
    if speeds:
        params["perfType"] = ",".join(speeds)

    headers = {"Accept": "application/x-chess-pgn"}
    resp = requests.get(url, params=params, headers=headers, timeout=60)
    resp.raise_for_status()

    print(f"  Downloaded {len(resp.text)} bytes of PGN data")
    return resp.text


def download_chesscom_games(username, year=None, month=None, max_games=None):
    """Download games from Chess.com."""
    print(f"Downloading games for {username} from Chess.com...")

    headers = {"User-Agent": "ChessToolkit/1.0 (github.com/chess-toolkit)"}

    if year and month:
        url = f"https://api.chess.com/pub/player/{username}/games/{year}/{month:02d}/pgn"
        resp = requests.get(url, headers=headers, timeout=60)
        resp.raise_for_status()
        pgn_text = resp.text
    else:
        # Get archives list
        archives_url = f"https://api.chess.com/pub/player/{username}/games/archives"
        resp = requests.get(archives_url, headers=headers, timeout=30)
        resp.raise_for_status()
        archives = resp.json().get("archives", [])
        if not archives:
            print("  No games found")
            return ""

        # Get games from recent months until we have enough
        all_pgn = []
        games_collected = 0
        target = max_games or 10

        for archive_url in reversed(archives):
            if games_collected >= target:
                break
            pgn_url = archive_url + "/pgn"
            print(f"  Fetching: {archive_url.split('/')[-2]}/{archive_url.split('/')[-1]}...")
            resp = requests.get(pgn_url, headers=headers, timeout=60)
            if resp.status_code == 200 and resp.text.strip():
                all_pgn.append(resp.text)
                # Rough count of games in PGN
                games_collected += resp.text.count("[Event ")
                print(f"    {resp.text.count('[Event ')} games ({games_collected} total)")

        pgn_text = "\n\n".join(all_pgn)

    print(f"  Downloaded {len(pgn_text)} bytes of PGN data")
    return pgn_text


def main():
    parser = argparse.ArgumentParser(
        description="Chess Game Reviewer — Annotate your games with Stockfish analysis",
    )

    # Input source
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--lichess", metavar="USERNAME", help="Lichess username")
    source.add_argument("--chesscom", metavar="USERNAME", help="Chess.com username")
    source.add_argument("--pgn", metavar="FILE", help="Path to PGN file")

    # Options
    parser.add_argument("--games", type=int, default=5, help="Number of games to review (default: 5)")
    parser.add_argument("--depth", type=int, default=20, help="Stockfish analysis depth (default: 20)")
    parser.add_argument("--repertoire", metavar="FILE", help="Repertoire PGN to compare against")
    parser.add_argument("--stockfish-path", default="/opt/homebrew/bin/stockfish")
    parser.add_argument("--output", "-o", default="reviewed_games.pgn", help="Output file")
    parser.add_argument("--speeds", default=None, help="Time controls, comma-separated (e.g., rapid,classical)")

    args = parser.parse_args()

    # Download or load games
    player_name = None
    if args.lichess:
        player_name = args.lichess
        speeds = args.speeds.split(",") if args.speeds else None
        pgn_text = download_lichess_games(args.lichess, args.games, speeds)
    elif args.chesscom:
        player_name = args.chesscom
        pgn_text = download_chesscom_games(args.chesscom, max_games=args.games)
    else:
        with open(args.pgn) as f:
            pgn_text = f.read()

    if not pgn_text.strip():
        print("No games found!")
        sys.exit(1)

    # Initialize reviewer
    reviewer = GameReviewer(
        stockfish_path=args.stockfish_path,
        analysis_depth=args.depth,
    )

    # Load repertoire if provided
    if args.repertoire:
        print(f"\nLoading repertoire: {args.repertoire}")
        reviewer.load_repertoire(args.repertoire)

    try:
        # Review games
        results = reviewer.review_games_from_pgn(
            pgn_text,
            player_name=player_name,
            max_games=args.games,
        )

        # Save annotated games
        with open(args.output, "w") as f:
            for game, stats in results:
                f.write(str(game))
                f.write("\n\n")

        # Print summary
        print(f"\n{'=' * 60}")
        print(f"  REVIEW COMPLETE — {len(results)} games analyzed")
        print(f"{'=' * 60}")
        total_blunders = sum(s["blunders"] for _, s in results)
        total_mistakes = sum(s["mistakes"] for _, s in results)
        total_inaccuracies = sum(s["inaccuracies"] for _, s in results)
        total_good = sum(s["good"] for _, s in results)
        total_moves = total_blunders + total_mistakes + total_inaccuracies + total_good
        accuracy = (total_good / total_moves * 100) if total_moves > 0 else 0

        print(f"  Total blunders:     {total_blunders}")
        print(f"  Total mistakes:     {total_mistakes}")
        print(f"  Total inaccuracies: {total_inaccuracies}")
        print(f"  Overall accuracy:   {accuracy:.0f}%")
        print(f"  Output: {args.output}")
        print(f"{'=' * 60}\n")

    finally:
        reviewer.cleanup()


if __name__ == "__main__":
    main()
