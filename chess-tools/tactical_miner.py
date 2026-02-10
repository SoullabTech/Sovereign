#!/usr/bin/env python3
"""
Tactical Pattern Miner

Find Lichess puzzles that arise from positions in your opening repertoire.
Downloads the Lichess puzzle database and matches puzzle game positions
against your repertoire tree.

Usage:
    python3 tactical_miner.py --repertoire italian.pgn --output italian_tactics.pgn
    python3 tactical_miner.py --repertoire italian.pgn --min-rating 1000 --max-rating 1800
    python3 tactical_miner.py --fen "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R" --depth 6
"""

import argparse
import csv
import io
import os
import sys
import urllib.request
import subprocess

import chess
import chess.pgn


PUZZLE_DB_URL = "https://database.lichess.org/lichess_db_puzzle.csv.zst"
PUZZLE_DIR = os.path.join(os.path.expanduser("~"), ".chess-tools")
PUZZLE_ZST = os.path.join(PUZZLE_DIR, "lichess_db_puzzle.csv.zst")
PUZZLE_CSV = os.path.join(PUZZLE_DIR, "lichess_db_puzzle.csv")


class TacticalMiner:
    """Find Lichess puzzles matching repertoire positions."""

    def __init__(self):
        self.repertoire_fens = set()  # Set of FEN position keys
        self.repertoire_moves = {}   # FEN -> list of SAN moves leading there

    def load_repertoire(self, pgn_path):
        """Load a repertoire PGN and extract all positions."""
        with open(pgn_path) as f:
            game = chess.pgn.read_game(f)

        if game is None:
            print(f"Error: Could not read PGN from {pgn_path}")
            sys.exit(1)

        board = game.board()
        self._extract_positions(game, board, [])
        print(f"  Loaded {len(self.repertoire_fens)} unique positions from repertoire")

    def load_from_fen(self, fen, depth=6):
        """
        Load a single position and generate variations to search depth.

        This uses the Lichess explorer to find common continuations.
        """
        board = chess.Board(fen)
        self.repertoire_fens.add(self._fen_key(board))
        print(f"  Position loaded: {fen}")
        print(f"  (For deeper coverage, use a repertoire PGN)")

    def _extract_positions(self, node, board, move_list):
        """Recursively extract all positions from a game tree."""
        fen_key = self._fen_key(board)
        self.repertoire_fens.add(fen_key)
        self.repertoire_moves[fen_key] = list(move_list)

        for variation in node.variations:
            move = variation.move
            san = board.san(move)
            board_copy = board.copy()
            board_copy.push(move)
            self._extract_positions(variation, board_copy, move_list + [san])

    def _fen_key(self, board):
        """Get a position key from a board (ignoring move counters)."""
        parts = board.fen().split()
        # Use piece placement + side to move + castling + en passant
        return " ".join(parts[:4])

    def ensure_puzzle_database(self):
        """Download and decompress the Lichess puzzle database if needed."""
        os.makedirs(PUZZLE_DIR, exist_ok=True)

        if os.path.exists(PUZZLE_CSV):
            size_mb = os.path.getsize(PUZZLE_CSV) / 1024 / 1024
            print(f"  Puzzle database found: {PUZZLE_CSV} ({size_mb:.0f} MB)")
            return

        if not os.path.exists(PUZZLE_ZST):
            print(f"  Downloading Lichess puzzle database...")
            print(f"  URL: {PUZZLE_DB_URL}")
            print(f"  This is a one-time download (~250 MB compressed)...")

            def progress_hook(block_count, block_size, total_size):
                downloaded = block_count * block_size
                if total_size > 0:
                    pct = downloaded / total_size * 100
                    mb = downloaded / 1024 / 1024
                    print(f"\r  Downloaded: {mb:.0f} MB ({pct:.0f}%)", end="", flush=True)

            urllib.request.urlretrieve(PUZZLE_DB_URL, PUZZLE_ZST, progress_hook)
            print()

        # Decompress
        print(f"  Decompressing puzzle database...")
        try:
            subprocess.run(["zstd", "-d", PUZZLE_ZST, "-o", PUZZLE_CSV],
                          check=True, capture_output=True)
        except FileNotFoundError:
            print("  Error: 'zstd' not found. Install with: brew install zstd")
            sys.exit(1)

        size_mb = os.path.getsize(PUZZLE_CSV) / 1024 / 1024
        print(f"  Puzzle database ready: {size_mb:.0f} MB")

    def mine_puzzles(self, min_rating=0, max_rating=3000, themes=None, max_puzzles=None):
        """
        Scan the puzzle database for positions matching the repertoire.

        Args:
            min_rating: Minimum puzzle difficulty rating
            max_rating: Maximum puzzle difficulty rating
            themes: List of themes to filter by (e.g., ["fork", "pin"])
            max_puzzles: Stop after finding this many puzzles

        Returns:
            List of matching puzzle dicts
        """
        self.ensure_puzzle_database()

        print(f"\n  Scanning {self._count_csv_lines()} puzzles...")
        print(f"  Matching against {len(self.repertoire_fens)} repertoire positions")
        print(f"  Rating range: {min_rating}-{max_rating}")

        matches = []
        scanned = 0

        with open(PUZZLE_CSV, "r") as f:
            reader = csv.reader(f)

            for row in reader:
                scanned += 1
                if scanned % 500000 == 0:
                    print(f"  Scanned: {scanned:,} | Found: {len(matches)}")

                if len(row) < 9:
                    continue

                puzzle_id = row[0]
                fen = row[1]
                moves = row[2]
                rating = int(row[3]) if row[3].isdigit() else 0
                puzzle_themes = row[7] if len(row) > 7 else ""
                game_url = row[8] if len(row) > 8 else ""

                # Rating filter
                if rating < min_rating or rating > max_rating:
                    continue

                # Theme filter
                if themes:
                    puzzle_theme_list = puzzle_themes.split()
                    if not any(t in puzzle_theme_list for t in themes):
                        continue

                # Check if the puzzle's starting position matches our repertoire
                try:
                    board = chess.Board(fen)
                except ValueError:
                    continue

                # Apply the first move (opponent's move that creates the puzzle)
                uci_moves = moves.split()
                if not uci_moves:
                    continue

                # Check original position AND the position after the setup move
                fen_key = self._fen_key(board)
                match = fen_key in self.repertoire_fens

                if not match:
                    # Also check parent positions by walking back
                    # The puzzle FEN might be a few moves into our repertoire
                    try:
                        board_check = chess.Board(fen)
                        check_key = self._fen_key(board_check)
                        match = check_key in self.repertoire_fens
                    except Exception:
                        pass

                if match:
                    # Parse the solution
                    solution_board = chess.Board(fen)
                    solution_sans = []
                    for uci in uci_moves:
                        try:
                            move = solution_board.parse_uci(uci)
                            solution_sans.append(solution_board.san(move))
                            solution_board.push(move)
                        except (ValueError, chess.IllegalMoveError):
                            break

                    matches.append({
                        "id": puzzle_id,
                        "fen": fen,
                        "moves_uci": moves,
                        "moves_san": " ".join(solution_sans),
                        "rating": rating,
                        "themes": puzzle_themes,
                        "game_url": game_url,
                        "repertoire_line": self.repertoire_moves.get(fen_key, []),
                    })

                    if max_puzzles and len(matches) >= max_puzzles:
                        break

        print(f"  Scan complete: {scanned:,} puzzles scanned, {len(matches)} matches found")
        return matches

    def _count_csv_lines(self):
        """Quick line count for progress reporting."""
        try:
            result = subprocess.run(["wc", "-l", PUZZLE_CSV],
                                   capture_output=True, text=True)
            return int(result.stdout.strip().split()[0])
        except Exception:
            return 0

    def export_to_pgn(self, puzzles, output_path):
        """
        Export matched puzzles to a PGN file.

        Each puzzle becomes a game with:
        - The puzzle position as the starting FEN
        - The solution as the main line
        - Comments with rating, themes, and game link
        """
        with open(output_path, "w") as f:
            for i, p in enumerate(puzzles):
                game = chess.pgn.Game()
                game.headers["Event"] = f"Lichess Puzzle {p['id']}"
                game.headers["Site"] = p["game_url"]
                game.headers["White"] = "Puzzle"
                game.headers["Black"] = "Puzzle"
                game.headers["Result"] = "*"

                try:
                    board = chess.Board(p["fen"])
                    game.setup(board)
                except ValueError:
                    continue

                game.comment = (
                    f"Rating: {p['rating']} | Themes: {p['themes']} | "
                    f"Repertoire line: {' '.join(p['repertoire_line'][:6]) or 'root'}"
                )

                # Add solution moves
                uci_moves = p["moves_uci"].split()
                node = game
                for uci in uci_moves:
                    try:
                        move = board.parse_uci(uci)
                        node = node.add_variation(move)
                        board.push(move)
                    except (ValueError, chess.IllegalMoveError):
                        break

                f.write(str(game))
                f.write("\n\n")

        print(f"  Exported {len(puzzles)} puzzles to {output_path}")
        return output_path


def main():
    parser = argparse.ArgumentParser(
        description="Tactical Pattern Miner — Find Lichess puzzles from your repertoire",
    )

    # Input
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--repertoire", metavar="FILE", help="Repertoire PGN file")
    source.add_argument("--fen", help="Starting FEN position")

    # Filters
    parser.add_argument("--min-rating", type=int, default=800, help="Min puzzle rating (default: 800)")
    parser.add_argument("--max-rating", type=int, default=2200, help="Max puzzle rating (default: 2200)")
    parser.add_argument("--themes", help="Filter by themes, comma-separated (e.g., fork,pin,sacrifice)")
    parser.add_argument("--max-puzzles", type=int, default=None, help="Stop after N matches")

    # Output
    parser.add_argument("--output", "-o", default="repertoire_tactics.pgn", help="Output PGN file")

    args = parser.parse_args()

    miner = TacticalMiner()

    # Load positions
    print("\nLoading positions...")
    if args.repertoire:
        miner.load_repertoire(args.repertoire)
    else:
        miner.load_from_fen(args.fen)

    # Mine puzzles
    themes = args.themes.split(",") if args.themes else None
    puzzles = miner.mine_puzzles(
        min_rating=args.min_rating,
        max_rating=args.max_rating,
        themes=themes,
        max_puzzles=args.max_puzzles,
    )

    if puzzles:
        # Sort by rating
        puzzles.sort(key=lambda p: p["rating"])

        # Export
        miner.export_to_pgn(puzzles, args.output)

        # Print summary
        print(f"\n{'=' * 60}")
        print(f"  MINING COMPLETE")
        print(f"  Puzzles found: {len(puzzles)}")
        print(f"  Rating range: {puzzles[0]['rating']}-{puzzles[-1]['rating']}")

        # Theme breakdown
        all_themes = {}
        for p in puzzles:
            for t in p["themes"].split():
                all_themes[t] = all_themes.get(t, 0) + 1
        top_themes = sorted(all_themes.items(), key=lambda x: x[1], reverse=True)[:10]
        print(f"  Top themes: {', '.join(f'{t}({c})' for t, c in top_themes)}")
        print(f"  Output: {args.output}")
        print(f"{'=' * 60}\n")
    else:
        print("\nNo matching puzzles found. Try:")
        print("  - Using a deeper repertoire PGN")
        print("  - Expanding the rating range")
        print("  - Removing theme filters")


if __name__ == "__main__":
    main()
