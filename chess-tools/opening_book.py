"""
Polyglot opening book reader.

Reads .bin format opening books (including HIARCS books converted to Polyglot format)
using python-chess's built-in Polyglot support.
"""

import chess
import chess.polyglot


class OpeningBookReader:
    """Reader for Polyglot (.bin) opening books."""

    def __init__(self, book_path=None):
        """
        Initialize the book reader.

        Args:
            book_path: Path to a .bin Polyglot opening book file.
                       If None, the reader is disabled (returns empty results).
        """
        self.book_path = book_path
        self.enabled = book_path is not None
        self._reader = None
        if self.enabled:
            try:
                self._reader = chess.polyglot.open_reader(book_path)
                print(f"  Opening book loaded: {book_path}")
            except Exception as e:
                print(f"  Warning: Could not load opening book: {e}")
                self.enabled = False

    def get_moves(self, board, min_weight=0):
        """
        Get book moves for a position.

        Args:
            board: chess.Board instance
            min_weight: Minimum weight threshold (higher = stronger recommendation)

        Returns:
            List of dicts with keys:
                - san: Move in SAN notation
                - uci: Move in UCI notation
                - weight: Book weight (higher = more recommended)
                - is_strong: True if weight is in the top tier for this position
        """
        if not self.enabled:
            return []

        try:
            entries = list(self._reader.find_all(board))
        except Exception:
            return []

        if not entries:
            return []

        max_weight = max(e.weight for e in entries) if entries else 1

        moves = []
        for entry in entries:
            if entry.weight < min_weight:
                continue
            move = entry.move
            moves.append({
                "san": board.san(move),
                "uci": move.uci(),
                "weight": entry.weight,
                "is_strong": entry.weight >= max_weight * 0.5,
            })

        # Sort by weight descending
        moves.sort(key=lambda m: m["weight"], reverse=True)
        return moves

    def has_position(self, board):
        """Check if the book contains this position."""
        if not self.enabled:
            return False
        try:
            entries = list(self._reader.find_all(board))
            return len(entries) > 0
        except Exception:
            return False

    def close(self):
        """Close the book reader."""
        if self._reader:
            self._reader.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
