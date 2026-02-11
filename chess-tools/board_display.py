"""
Terminal chess board renderer with ANSI color highlighting.

Renders a Unicode chess board in the terminal with support for
highlighting the last move (yellow) and best move (green).
"""

import sys
import chess

# Unicode piece symbols
PIECE_SYMBOLS = {
    chess.KING:   {chess.WHITE: "\u2654", chess.BLACK: "\u265a"},
    chess.QUEEN:  {chess.WHITE: "\u2655", chess.BLACK: "\u265b"},
    chess.ROOK:   {chess.WHITE: "\u2656", chess.BLACK: "\u265c"},
    chess.BISHOP: {chess.WHITE: "\u2657", chess.BLACK: "\u265d"},
    chess.KNIGHT: {chess.WHITE: "\u2658", chess.BLACK: "\u265e"},
    chess.PAWN:   {chess.WHITE: "\u2659", chess.BLACK: "\u265f"},
}

# ANSI color codes
LIGHT_SQ = "\033[48;5;223m"   # warm tan
DARK_SQ = "\033[48;5;137m"    # brown
LAST_MOVE_LIGHT = "\033[48;5;186m"  # yellow-tan
LAST_MOVE_DARK = "\033[48;5;143m"   # dark yellow
BEST_MOVE_LIGHT = "\033[48;5;157m"  # light green
BEST_MOVE_DARK = "\033[48;5;71m"    # dark green
WHITE_PIECE = "\033[97m"      # bright white
BLACK_PIECE = "\033[30m"      # black
RESET = "\033[0m"
DIM = "\033[2m"


def _is_tty():
    """Check if stdout supports ANSI colors."""
    return hasattr(sys.stdout, 'isatty') and sys.stdout.isatty()


def terminal_board(board, last_move=None, best_move=None, flipped=False):
    """
    Render a chess board for terminal display.

    Args:
        board: chess.Board instance
        last_move: chess.Move to highlight in yellow (last played move)
        best_move: chess.Move to highlight in green (engine recommendation)
        flipped: If True, show from Black's perspective

    Returns:
        Multi-line string ready for printing
    """
    use_color = _is_tty()

    last_squares = set()
    best_squares = set()
    if last_move:
        last_squares = {last_move.from_square, last_move.to_square}
    if best_move:
        best_squares = {best_move.from_square, best_move.to_square}

    ranks = range(8) if flipped else range(7, -1, -1)
    files = range(7, -1, -1) if flipped else range(8)

    lines = []

    # File labels
    file_labels = "    " + "   ".join(chr(ord('a') + f) for f in files) + "  "
    lines.append(file_labels)
    lines.append("  +" + "---+" * 8)

    for rank in ranks:
        row = f"{rank + 1} |"
        for file in files:
            sq = chess.square(file, rank)
            piece = board.piece_at(sq)
            is_light = (rank + file) % 2 == 1

            if use_color:
                # Determine background color
                if sq in best_squares:
                    bg = BEST_MOVE_LIGHT if is_light else BEST_MOVE_DARK
                elif sq in last_squares:
                    bg = LAST_MOVE_LIGHT if is_light else LAST_MOVE_DARK
                else:
                    bg = LIGHT_SQ if is_light else DARK_SQ

                # Piece or empty
                if piece:
                    fg = WHITE_PIECE if piece.color == chess.WHITE else BLACK_PIECE
                    symbol = PIECE_SYMBOLS[piece.piece_type][piece.color]
                    row += f"{bg}{fg} {symbol} {RESET}|"
                else:
                    row += f"{bg}   {RESET}|"
            else:
                # Plain ASCII fallback
                if piece:
                    symbol = piece.symbol()
                    row += f" {symbol} |"
                else:
                    row += "   |"

        row += f" {rank + 1}"
        lines.append(row)
        lines.append("  +" + "---+" * 8)

    lines.append(file_labels)

    return "\n".join(lines)
