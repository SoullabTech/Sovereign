#!/usr/bin/env python3
"""
Chess Opening Repertoire Generator

Builds a complete opening repertoire tree by combining:
- Lichess database (500M+ games) — for opponent move frequencies
- Masters database (3M+ games) — for best repertoire moves
- Polyglot opening book — for curated alternative moves (optional)
- Stockfish engine — for evaluation of every leaf position

Usage:
    python3 repertoire_generator.py --moves "e4 e5 Nf3 Nc6 Bc4" --side white
    python3 repertoire_generator.py --fen "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3" --side white
    python3 repertoire_generator.py --help
"""

import argparse
import sys
import time

import chess

from config import DEFAULTS, print_config
from lichess_api import LichessExplorer
from engine_analysis import StockfishAnalyzer
from opening_book import OpeningBookReader
from pgn_builder import PGNBuilder


class RepertoireGenerator:
    """Generates opening repertoire trees from multiple data sources."""

    def __init__(self, config):
        self.config = config
        self.side = chess.WHITE if config["side"] == "white" else chess.BLACK

        # Initialize components
        print("Initializing components...")
        self.explorer = LichessExplorer(
            api_delay=config["api_delay"],
            api_token=config.get("api_token"),
        )
        self.engine = StockfishAnalyzer(
            stockfish_path=config["stockfish_path"],
            depth=config["stockfish_depth"],
            hash_mb=config.get("stockfish_hash", 256),
            threads=config.get("stockfish_threads", 4),
        )
        self.book = OpeningBookReader(config.get("book_path"))
        print("  Lichess Explorer: ready")
        print(f"  Stockfish: ready (depth {config['stockfish_depth']})")
        if self.book.enabled:
            print(f"  Opening book: loaded")
        else:
            print("  Opening book: not configured (skipping)")

        # Stats
        self._api_calls = 0
        self._nodes_created = 0
        self._start_time = None
        self.pgn = None  # Accessible for partial saves on interrupt

    def generate(self, starting_board):
        """
        Generate the full repertoire tree from a starting position.

        Args:
            starting_board: chess.Board with the starting position

        Returns:
            PGNBuilder with the complete tree
        """
        self._start_time = time.time()
        side_name = "White" if self.side == chess.WHITE else "Black"

        # Create PGN (stored on self so partial saves work on Ctrl+C)
        event = f"{side_name} Repertoire"
        self.pgn = PGNBuilder(self.config["side"], event=event)
        pgn = self.pgn
        pgn.set_starting_position(starting_board)

        print(f"\nBuilding {side_name} repertoire tree...")
        print(f"Starting position: {starting_board.fen()}")
        print()

        # Build the tree recursively
        self._build_tree(starting_board.copy(), pgn.game, 0)

        elapsed = time.time() - self._start_time
        print(f"\n{'=' * 60}")
        print(f"  COMPLETE")
        print(f"  Nodes: {self._nodes_created}")
        print(f"  API calls: {self._api_calls}")
        print(f"  Positions analyzed: {self.engine.positions_analyzed}")
        print(f"  Time: {elapsed:.0f}s ({elapsed/60:.1f} min)")
        print(f"{'=' * 60}\n")

        return pgn

    def _build_tree(self, board, node, depth):
        """Recursively build the opening tree."""
        # Check depth limit
        if depth >= self.config["max_depth"]:
            self._add_eval(board, node, "max depth reached")
            return

        is_our_turn = (board.turn == self.side)

        if is_our_turn:
            self._handle_our_turn(board, node, depth)
        else:
            self._handle_opponent_turn(board, node, depth)

    def _handle_opponent_turn(self, board, node, depth):
        """Handle opponent's move: get popular moves from Lichess."""
        fen = board.fen()
        move_num = board.fullmove_number
        prefix = "  " * (depth // 2)

        # Query Lichess for opponent moves
        data = self.explorer.get_lichess_moves(
            fen,
            ratings=self.config["ratings"],
            speeds=self.config["speeds"],
        )
        self._api_calls += 1

        total_games = data["total_games"]
        moves = data["moves"]

        if total_games < self.config["min_games"] or not moves:
            self._add_eval(board, node, f"only {total_games:,} games")
            return

        # Filter by cumulative frequency
        selected = self._filter_by_cumulative_freq(moves, self.config["cumulative_freq"])

        side_label = "Black" if board.turn == chess.BLACK else "White"
        print(f"{prefix}Move {move_num} ({side_label}): {len(selected)} opponent moves "
              f"from {total_games:,} games")

        for move_data in selected:
            san = move_data["san"]
            freq = move_data["frequency"]
            games = move_data["games"]

            board_copy = board.copy()
            try:
                move = board_copy.parse_san(san)
                child = node.add_variation(move)
            except (ValueError, chess.IllegalMoveError):
                continue

            child.comment = f"{freq}% of {total_games:,} games ({games:,} games)"
            self._nodes_created += 1

            board_copy.push(move)
            self._build_tree(board_copy, child, depth + 1)

    def _handle_our_turn(self, board, node, depth):
        """Handle our move: pick best from Masters DB, add book alternatives."""
        fen = board.fen()
        move_num = board.fullmove_number
        prefix = "  " * (depth // 2)
        side_label = "White" if board.turn == chess.WHITE else "Black"

        # 1. Query Masters database for best move
        masters_data = self.explorer.get_masters_moves(fen)
        self._api_calls += 1
        masters_moves = masters_data["moves"]

        # 2. Query Lichess as fallback
        lichess_data = self.explorer.get_lichess_moves(
            fen,
            ratings=self.config["ratings"],
            speeds=self.config["speeds"],
        )
        self._api_calls += 1

        # 3. Get book moves
        book_moves = self.book.get_moves(board)

        # Determine the main repertoire move
        main_move = None
        main_source = "lichess"
        main_score = None
        main_games = None

        # Only trust Masters moves with enough games (at least 10)
        reliable_masters = [m for m in masters_moves if m["games"] >= 10]
        if reliable_masters:
            best = self._best_scoring_move(reliable_masters, board.turn)
            if best:
                main_move = best["san"]
                main_source = "masters"
                main_score = best["score_white"] if board.turn == chess.WHITE else best["score_black"]
                main_games = best["games"]

        if main_move is None and lichess_data["moves"]:
            # Fallback to most popular Lichess move with decent score
            best = self._best_scoring_move(lichess_data["moves"], board.turn)
            if best:
                main_move = best["san"]
                main_source = "lichess"
                main_score = best["score_white"] if board.turn == chess.WHITE else best["score_black"]
                main_games = best["games"]

        if main_move is None:
            # No data at all — evaluate and stop
            self._add_eval(board, node, "no database moves")
            return

        print(f"{prefix}Move {move_num} ({side_label}): {main_move} "
              f"({main_source}, {main_score:.1f}%"
              f"{f', {main_games:,} games' if main_games else ''})")

        # Add main repertoire move
        board_copy = board.copy()
        try:
            move = board_copy.parse_san(main_move)
            child = node.add_variation(move)
        except (ValueError, chess.IllegalMoveError):
            self._add_eval(board, node, "invalid move from database")
            return

        parts = []
        if main_source == "masters":
            parts.append("Masters DB")
        else:
            parts.append("Lichess DB")
        if main_score is not None:
            parts.append(f"Score: {main_score:.1f}%")
        if main_games is not None:
            parts.append(f"({main_games:,} games)")
        child.comment = " | ".join(parts)

        self._nodes_created += 1
        board_copy.push(move)
        self._build_tree(board_copy, child, depth + 1)

        # Add book alternatives that aren't the main move
        for bm in book_moves:
            if bm["san"] == main_move:
                continue
            if not bm["is_strong"]:
                continue

            board_copy2 = board.copy()
            try:
                alt_move = board_copy2.parse_san(bm["san"])
                alt_child = node.add_variation(alt_move)
            except (ValueError, chess.IllegalMoveError):
                continue

            alt_child.nags.add(chess.pgn.NAG_GOOD_MOVE)
            alt_child.comment = f"Book recommendation (weight: {bm['weight']})"
            self._nodes_created += 1

            board_copy2.push(alt_move)
            self._build_tree(board_copy2, alt_child, depth + 1)

    def _add_eval(self, board, node, reason):
        """Add Stockfish evaluation to a leaf node."""
        eval_result = self.engine.evaluate(board)
        classification = self.engine.classify_eval(eval_result)

        parts = [node.comment] if node.comment else []
        parts.append(f"Eval: {eval_result['eval_str']}")
        parts.append(f"({classification})")
        if eval_result.get("best_move"):
            parts.append(f"Best: {eval_result['best_move']}")
        parts.append(f"[{reason}]")
        node.comment = " | ".join(parts)

    def _filter_by_cumulative_freq(self, moves, target):
        """Select moves that cumulatively cover `target` fraction of games."""
        if not moves:
            return []

        total = sum(m["games"] for m in moves)
        if total == 0:
            return []

        # Sort by games played (most popular first)
        sorted_moves = sorted(moves, key=lambda m: m["games"], reverse=True)

        selected = []
        cumulative = 0
        for m in sorted_moves:
            selected.append(m)
            cumulative += m["games"] / total
            if cumulative >= target:
                break

        return selected

    def _best_scoring_move(self, moves, turn):
        """Pick the move with the best score for the given side."""
        if not moves:
            return None

        key = "score_white" if turn == chess.WHITE else "score_black"
        return max(moves, key=lambda m: m[key])

    def cleanup(self):
        """Clean up resources."""
        self.engine.quit()
        self.book.close()


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Chess Opening Repertoire Generator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Italian Game for White
  python3 repertoire_generator.py --moves "e4 e5 Nf3 Nc6 Bc4" --side white

  # Sicilian Defense for Black
  python3 repertoire_generator.py --moves "e4 c5" --side black

  # From a specific FEN position
  python3 repertoire_generator.py --fen "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2" --side black

  # With custom parameters
  python3 repertoire_generator.py --moves "d4 d5 c4" --side white \\
    --min-games 1000 --cumulative-freq 0.90 --max-depth 20 \\
    --ratings 2000,2200,2500 --speeds classical \\
    --stockfish-depth 30 --output queens_gambit.pgn
        """,
    )

    # Position input (one of these required)
    pos_group = parser.add_mutually_exclusive_group(required=True)
    pos_group.add_argument(
        "--moves",
        help="Starting moves in SAN notation (e.g., \"e4 e5 Nf3 Nc6 Bc4\")",
    )
    pos_group.add_argument(
        "--fen",
        help="Starting position in FEN notation",
    )

    parser.add_argument(
        "--side",
        choices=["white", "black"],
        default=DEFAULTS["side"],
        help=f"Side to build repertoire for (default: {DEFAULTS['side']})",
    )

    # Tree parameters
    parser.add_argument(
        "--min-games", type=int, default=DEFAULTS["min_games"],
        help=f"Stop when fewer games than this (default: {DEFAULTS['min_games']})",
    )
    parser.add_argument(
        "--cumulative-freq", type=float, default=DEFAULTS["cumulative_freq"],
        help=f"Cover this fraction of opponent responses (default: {DEFAULTS['cumulative_freq']})",
    )
    parser.add_argument(
        "--max-depth", type=int, default=DEFAULTS["max_depth"],
        help=f"Maximum half-moves deep (default: {DEFAULTS['max_depth']})",
    )

    # Database filters
    parser.add_argument(
        "--ratings",
        default=",".join(str(r) for r in DEFAULTS["ratings"]),
        help=f"Rating groups, comma-separated (default: {','.join(str(r) for r in DEFAULTS['ratings'])})",
    )
    parser.add_argument(
        "--speeds",
        default=",".join(DEFAULTS["speeds"]),
        help=f"Time controls, comma-separated (default: {','.join(DEFAULTS['speeds'])})",
    )

    # Stockfish
    parser.add_argument(
        "--stockfish-path",
        default=DEFAULTS["stockfish_path"],
        help=f"Path to Stockfish binary (default: {DEFAULTS['stockfish_path']})",
    )
    parser.add_argument(
        "--stockfish-depth", type=int, default=DEFAULTS["stockfish_depth"],
        help=f"Stockfish analysis depth (default: {DEFAULTS['stockfish_depth']})",
    )

    # Opening book
    parser.add_argument(
        "--book-path",
        default=DEFAULTS["book_path"],
        help="Path to Polyglot .bin opening book (optional)",
    )

    # API
    parser.add_argument(
        "--api-delay", type=float, default=DEFAULTS["api_delay"],
        help=f"Seconds between API requests (default: {DEFAULTS['api_delay']})",
    )
    parser.add_argument(
        "--api-token",
        default=DEFAULTS["api_token"],
        help="Lichess API token for higher rate limits (optional)",
    )

    # Output
    parser.add_argument(
        "--output", "-o",
        default=DEFAULTS["output"],
        help=f"Output PGN file path (default: {DEFAULTS['output']})",
    )

    return parser.parse_args()


def build_starting_board(args):
    """Create the starting board from moves or FEN."""
    if args.fen:
        try:
            board = chess.Board(args.fen)
            return board
        except ValueError as e:
            print(f"Error: Invalid FEN: {e}")
            sys.exit(1)

    board = chess.Board()
    moves = args.moves.split()
    for san in moves:
        try:
            board.push_san(san)
        except (ValueError, chess.IllegalMoveError) as e:
            print(f"Error: Invalid move '{san}': {e}")
            sys.exit(1)
    return board


def main():
    args = parse_args()

    # Build config dict
    config = {
        "side": args.side,
        "ratings": [int(r) for r in args.ratings.split(",")],
        "speeds": args.speeds.split(","),
        "min_games": args.min_games,
        "cumulative_freq": args.cumulative_freq,
        "max_depth": args.max_depth,
        "stockfish_path": args.stockfish_path,
        "stockfish_depth": args.stockfish_depth,
        "stockfish_hash": DEFAULTS["stockfish_hash"],
        "stockfish_threads": DEFAULTS["stockfish_threads"],
        "book_path": args.book_path,
        "api_delay": args.api_delay,
        "api_token": args.api_token,
        "output": args.output,
    }

    print_config(config)

    # Build starting position
    board = build_starting_board(args)

    # Generate repertoire
    gen = RepertoireGenerator(config)
    try:
        pgn = gen.generate(board)
        filepath = pgn.save(config["output"])
        print(f"Repertoire saved to: {filepath}")
    except KeyboardInterrupt:
        print("\n\nInterrupted by user.")
        if gen.pgn:
            filepath = gen.pgn.save(config["output"])
            print(f"Partial repertoire saved to: {filepath}")
        else:
            print("No tree built yet — nothing to save.")
    except Exception as e:
        print(f"\n\nError: {e}")
        if gen.pgn:
            filepath = gen.pgn.save(config["output"])
            print(f"Partial repertoire saved to: {filepath}")
            print("You can resume by running the same command — cached positions will be reused.")
        else:
            print("No tree built yet — nothing to save.")
    finally:
        gen.cleanup()


if __name__ == "__main__":
    main()
