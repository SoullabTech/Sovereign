"""
Stockfish engine wrapper.

Provides position evaluation using Stockfish via python-chess's engine interface.
"""

import chess
import chess.engine


class StockfishAnalyzer:
    """Wrapper around Stockfish for position evaluation."""

    def __init__(self, stockfish_path="/opt/homebrew/bin/stockfish", depth=25,
                 hash_mb=256, threads=2):
        self.depth = depth
        self.engine = chess.engine.SimpleEngine.popen_uci(stockfish_path)
        self.engine.configure({"Hash": hash_mb, "Threads": threads})
        self._positions_analyzed = 0

    def evaluate(self, board):
        """
        Evaluate a position at the configured depth.

        Args:
            board: chess.Board instance

        Returns:
            dict with keys:
                - score_cp: centipawn score from White's perspective (None if mate)
                - mate_in: mate-in-N from White's perspective (None if not mate)
                - eval_str: human-readable eval string (e.g., "+0.45", "#3", "0.00")
                - best_move: best move in SAN notation
        """
        info = self.engine.analyse(board, chess.engine.Limit(depth=self.depth))
        score = info["score"].white()

        result = {
            "score_cp": None,
            "mate_in": None,
            "eval_str": "",
            "best_move": None,
        }

        if score.is_mate():
            mate = score.mate()
            result["mate_in"] = mate
            if mate > 0:
                result["eval_str"] = f"#+{mate}"
            elif mate < 0:
                result["eval_str"] = f"#-{abs(mate)}"
            else:
                result["eval_str"] = "#0"
        else:
            cp = score.score()
            result["score_cp"] = cp
            val = cp / 100.0
            if val > 0:
                result["eval_str"] = f"+{val:.2f}"
            elif val < 0:
                result["eval_str"] = f"{val:.2f}"
            else:
                result["eval_str"] = "0.00"

        # Get the best move
        pv = info.get("pv")
        if pv:
            result["best_move"] = board.san(pv[0])

        self._positions_analyzed += 1
        return result

    def classify_eval(self, eval_result):
        """
        Classify an evaluation into a human-readable assessment.

        Returns one of: "winning for White", "better for White", "slightly better for White",
                        "equal", "slightly better for Black", "better for Black", "winning for Black"
        """
        if eval_result["mate_in"] is not None:
            mate = eval_result["mate_in"]
            if mate > 0:
                return "winning for White"
            else:
                return "winning for Black"

        cp = eval_result["score_cp"]
        if cp is None:
            return "equal"

        abs_cp = abs(cp)
        if abs_cp < 25:
            return "equal"
        elif abs_cp < 75:
            label = "slightly better for"
        elif abs_cp < 200:
            label = "better for"
        else:
            label = "winning for"

        side = "White" if cp > 0 else "Black"
        return f"{label} {side}"

    @property
    def positions_analyzed(self):
        return self._positions_analyzed

    def quit(self):
        """Shut down the engine cleanly."""
        self.engine.quit()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.quit()
