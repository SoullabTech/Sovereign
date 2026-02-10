#!/usr/bin/env python3
"""
Chess Position Coach

Analyze any position with master-level explanations. Combines Stockfish analysis
with strategic pattern detection to explain WHY moves are good or bad.

Features:
- Top 3 candidate moves with evaluations
- Pawn structure analysis (doubled, isolated, passed pawns)
- Piece activity assessment
- King safety evaluation
- Tactical motif detection (pins, forks, hanging pieces)
- Strategic plan suggestions

Usage:
    python3 position_coach.py --fen "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"
    python3 position_coach.py --moves "e4 e5 Nf3 Nc6 Bc4"
    python3 position_coach.py --pgn game.pgn --move-number 12
"""

import argparse
import sys

import chess
import chess.pgn
import io

from engine_analysis import StockfishAnalyzer


class PositionCoach:
    """Analyzes positions and provides master-level explanations."""

    def __init__(self, stockfish_path="/opt/homebrew/bin/stockfish",
                 analysis_depth=25, threads=4):
        self.engine = StockfishAnalyzer(
            stockfish_path=stockfish_path,
            depth=analysis_depth,
            threads=threads,
        )

    def analyze(self, board, verbose=True):
        """
        Full position analysis with strategic explanations.

        Args:
            board: chess.Board instance
            verbose: Print results to console

        Returns:
            dict with analysis results
        """
        analysis = {}

        # 1. Engine analysis — top 3 candidate moves
        analysis["candidates"] = self._get_candidates(board, n=3)

        # 2. Pawn structure
        analysis["pawn_structure"] = {
            "white": self._analyze_pawns(board, chess.WHITE),
            "black": self._analyze_pawns(board, chess.BLACK),
        }

        # 3. Piece activity
        analysis["piece_activity"] = {
            "white": self._analyze_pieces(board, chess.WHITE),
            "black": self._analyze_pieces(board, chess.BLACK),
        }

        # 4. King safety
        analysis["king_safety"] = {
            "white": self._analyze_king(board, chess.WHITE),
            "black": self._analyze_king(board, chess.BLACK),
        }

        # 5. Tactical motifs
        analysis["tactics"] = self._find_tactics(board)

        # 6. Strategic assessment
        analysis["assessment"] = self._strategic_assessment(board, analysis)

        if verbose:
            self._print_analysis(board, analysis)

        return analysis

    def _get_candidates(self, board, n=3):
        """Get top N candidate moves with evaluations using MultiPV."""
        import chess.engine

        info_list = self.engine.engine.analyse(
            board,
            chess.engine.Limit(depth=self.engine.depth),
            multipv=n,
        )

        candidates = []
        for info in info_list:
            pv = info.get("pv", [])
            if not pv:
                continue

            move = pv[0]
            score = info["score"].white()

            eval_result = {
                "score_cp": None,
                "mate_in": None,
                "eval_str": "",
            }

            if score.is_mate():
                mate = score.mate()
                eval_result["mate_in"] = mate
                eval_result["eval_str"] = f"#+{mate}" if mate > 0 else f"#-{abs(mate)}"
            else:
                cp = score.score()
                eval_result["score_cp"] = cp
                val = cp / 100.0
                eval_result["eval_str"] = f"+{val:.2f}" if val >= 0 else f"{val:.2f}"

            # Get the continuation line in SAN
            line_board = board.copy()
            line_san = []
            for m in pv[:6]:
                try:
                    line_san.append(line_board.san(m))
                    line_board.push(m)
                except Exception:
                    break

            candidates.append({
                "move": board.san(move),
                "eval": eval_result,
                "line": " ".join(line_san),
                "rank": info.get("multipv", len(candidates) + 1),
            })

        return candidates

    def _analyze_pawns(self, board, color):
        """Comprehensive pawn structure analysis."""
        pawns = board.pieces(chess.PAWN, color)
        enemy_pawns = board.pieces(chess.PAWN, not color)
        color_name = "White" if color == chess.WHITE else "Black"

        # Group pawns by file
        files = [[] for _ in range(8)]
        for sq in pawns:
            files[chess.square_file(sq)].append(sq)

        result = {
            "count": len(pawns),
            "doubled": [],
            "isolated": [],
            "passed": [],
            "islands": 0,
            "notes": [],
        }

        # Doubled pawns
        for f_idx, f_pawns in enumerate(files):
            if len(f_pawns) > 1:
                file_name = chr(ord('a') + f_idx)
                result["doubled"].append(file_name)
                result["notes"].append(
                    f"Doubled pawns on {file_name}-file — structural weakness"
                )

        # Pawn islands
        in_island = False
        for f_pawns in files:
            if len(f_pawns) > 0:
                if not in_island:
                    result["islands"] += 1
                    in_island = True
            else:
                in_island = False

        if result["islands"] > 2:
            result["notes"].append(
                f"{result['islands']} pawn islands — fragmented structure"
            )

        # Isolated and passed pawns
        for sq in pawns:
            file_idx = chess.square_file(sq)
            rank = chess.square_rank(sq)
            sq_name = chess.square_name(sq)

            # Isolated check
            has_neighbor = False
            for adj in [file_idx - 1, file_idx + 1]:
                if 0 <= adj < 8 and len(files[adj]) > 0:
                    has_neighbor = True
                    break
            if not has_neighbor:
                result["isolated"].append(sq_name)
                result["notes"].append(
                    f"Isolated pawn on {sq_name} — no adjacent pawn support"
                )

            # Passed pawn check
            direction = 1 if color == chess.WHITE else -1
            is_passed = True
            for check_rank in range(rank + direction, (8 if direction > 0 else -1), direction):
                for check_file in [file_idx - 1, file_idx, file_idx + 1]:
                    if 0 <= check_file < 8:
                        check_sq = chess.square(check_file, check_rank)
                        if check_sq in enemy_pawns:
                            is_passed = False
                            break
                if not is_passed:
                    break
            if is_passed:
                result["passed"].append(sq_name)
                result["notes"].append(
                    f"Passed pawn on {sq_name} — potential promotion threat!"
                )

        return result

    def _analyze_pieces(self, board, color):
        """Analyze piece placement and activity."""
        color_name = "White" if color == chess.WHITE else "Black"
        result = {
            "developed": 0,
            "undeveloped": [],
            "bishop_pair": False,
            "centralized": [],
            "trapped": [],
            "notes": [],
        }

        center = {chess.D4, chess.D5, chess.E4, chess.E5}
        extended_center = center | {chess.C3, chess.C4, chess.C5, chess.C6,
                                     chess.D3, chess.D6, chess.E3, chess.E6,
                                     chess.F3, chess.F4, chess.F5, chess.F6}

        # Starting squares for development check
        if color == chess.WHITE:
            back_rank = range(chess.A1, chess.H1 + 1)
        else:
            back_rank = range(chess.A8, chess.H8 + 1)

        # Check each piece
        for sq in chess.SQUARES:
            piece = board.piece_at(sq)
            if piece is None or piece.color != color:
                continue
            if piece.piece_type in (chess.PAWN, chess.KING):
                continue

            sq_name = chess.square_name(sq)
            piece_name = chess.piece_name(piece.piece_type).capitalize()

            # Centralization
            if sq in center:
                result["centralized"].append(f"{piece_name} on {sq_name}")

            # Development (minor pieces still on back rank)
            if piece.piece_type in (chess.KNIGHT, chess.BISHOP):
                if sq in back_rank:
                    result["undeveloped"].append(f"{piece_name} on {sq_name}")
                else:
                    result["developed"] += 1

            # Mobility (trapped piece detection)
            # Use attack squares instead of legal moves (works for both sides)
            # Only flag after the opening (move 10+) and not on starting squares
            is_starting = (sq in back_rank)
            if not is_starting and board.fullmove_number >= 10:
                attack_squares = board.attacks(sq)
                mobility = sum(1 for a_sq in attack_squares
                              if board.piece_at(a_sq) is None or board.color_at(a_sq) != color)
                if mobility == 0 and piece.piece_type in (chess.BISHOP, chess.KNIGHT, chess.ROOK):
                    result["trapped"].append(f"{piece_name} on {sq_name}")
                    result["notes"].append(
                        f"{piece_name} on {sq_name} is trapped — no available squares!"
                    )

        # Bishop pair
        bishops = board.pieces(chess.BISHOP, color)
        if len(bishops) >= 2:
            light = any(chess.square_rank(sq) % 2 == chess.square_file(sq) % 2 for sq in bishops)
            dark = any(chess.square_rank(sq) % 2 != chess.square_file(sq) % 2 for sq in bishops)
            if light and dark:
                result["bishop_pair"] = True
                result["notes"].append("Bishop pair — advantage in open positions")

        if result["undeveloped"]:
            result["notes"].append(
                f"Undeveloped: {', '.join(result['undeveloped'])} — prioritize development"
            )

        if result["centralized"]:
            result["notes"].append(
                f"Strong central presence: {', '.join(result['centralized'])}"
            )

        return result

    def _analyze_king(self, board, color):
        """Evaluate king safety."""
        king_sq = board.king(color)
        if king_sq is None:
            return {"score": 0, "notes": []}

        color_name = "White" if color == chess.WHITE else "Black"
        result = {
            "castled": False,
            "pawn_shield": 0,
            "open_files": 0,
            "attackers_nearby": 0,
            "escape_squares": 0,
            "notes": [],
        }

        king_file = chess.square_file(king_sq)
        king_rank = chess.square_rank(king_sq)

        # Castled check
        if color == chess.WHITE:
            if king_file >= 6:  # Kingside castled
                result["castled"] = True
            elif king_file <= 2:  # Queenside castled
                result["castled"] = True
        else:
            if king_file >= 6 or king_file <= 2:
                result["castled"] = True

        # Pawn shield
        shield_direction = 1 if color == chess.WHITE else -1
        for df in [-1, 0, 1]:
            f = king_file + df
            r = king_rank + shield_direction
            if 0 <= f < 8 and 0 <= r < 8:
                sq = chess.square(f, r)
                piece = board.piece_at(sq)
                if piece and piece.piece_type == chess.PAWN and piece.color == color:
                    result["pawn_shield"] += 1

        if result["pawn_shield"] == 0 and result["castled"]:
            result["notes"].append("No pawn shield in front of king — vulnerable!")
        elif result["pawn_shield"] < 2 and result["castled"]:
            result["notes"].append("Weakened pawn shield — potential attack target")

        # Open files near king
        for df in [-1, 0, 1]:
            f = king_file + df
            if 0 <= f < 8:
                has_pawn = False
                for r in range(8):
                    sq = chess.square(f, r)
                    piece = board.piece_at(sq)
                    if piece and piece.piece_type == chess.PAWN:
                        has_pawn = True
                        break
                if not has_pawn:
                    result["open_files"] += 1

        if result["open_files"] > 0:
            result["notes"].append(
                f"{result['open_files']} open file(s) near king — enemy rooks/queen can infiltrate"
            )

        # Escape squares
        for move in board.legal_moves:
            if move.from_square == king_sq:
                result["escape_squares"] += 1

        if result["escape_squares"] == 0 and result["castled"]:
            result["notes"].append("King has NO escape squares — back-rank mate possible!")

        if not result["castled"] and board.fullmove_number > 10:
            result["notes"].append("King still in the center after move 10 — castling urgently needed")

        return result

    def _find_tactics(self, board):
        """Detect tactical motifs in the position."""
        tactics = []
        side = board.turn

        # Check for hanging pieces (undefended pieces under attack)
        for sq in chess.SQUARES:
            piece = board.piece_at(sq)
            if piece is None:
                continue

            # Is this piece attacked by the opponent?
            if board.is_attacked_by(not piece.color, sq):
                # Is it defended?
                if not board.is_attacked_by(piece.color, sq):
                    sq_name = chess.square_name(sq)
                    piece_name = chess.piece_name(piece.piece_type).capitalize()
                    color_name = "White" if piece.color == chess.WHITE else "Black"
                    tactics.append(
                        f"Hanging {color_name} {piece_name} on {sq_name}! (undefended and attacked)"
                    )

        # Check for pins
        for sq in chess.SQUARES:
            piece = board.piece_at(sq)
            if piece is None:
                continue
            if board.is_pinned(piece.color, sq):
                sq_name = chess.square_name(sq)
                piece_name = chess.piece_name(piece.piece_type).capitalize()
                color_name = "White" if piece.color == chess.WHITE else "Black"
                tactics.append(f"{color_name} {piece_name} on {sq_name} is pinned")

        # Check for checks available
        for move in board.legal_moves:
            if board.gives_check(move):
                san = board.san(move)
                tactics.append(f"Check available: {san}")

        # Fork detection: after each legal move, does the moved piece attack 2+ enemy pieces?
        for move in board.legal_moves:
            board.push(move)
            to_sq = move.to_square
            piece = board.piece_at(to_sq)
            if piece and piece.piece_type in (chess.KNIGHT, chess.QUEEN, chess.PAWN):
                attacked = board.attacks(to_sq)
                targets = []
                for a_sq in attacked:
                    target = board.piece_at(a_sq)
                    if target and target.color != piece.color:
                        if target.piece_type in (chess.ROOK, chess.QUEEN, chess.KING):
                            targets.append(chess.piece_name(target.piece_type))
                if len(targets) >= 2:
                    san = board.peek().uci()  # Already pushed
                    board.pop()
                    san = board.san(move)
                    tactics.append(
                        f"Fork opportunity: {san} attacks {' and '.join(targets)}"
                    )
                    continue
            board.pop()

        return tactics

    def _strategic_assessment(self, board, analysis):
        """Generate an overall strategic assessment."""
        notes = []
        side = "White" if board.turn == chess.WHITE else "Black"
        candidates = analysis["candidates"]

        # Overall eval
        if candidates:
            best = candidates[0]
            ev = best["eval"]
            if ev["mate_in"] is not None:
                if ev["mate_in"] > 0:
                    notes.append(f"Forced mate in {ev['mate_in']} for White!")
                else:
                    notes.append(f"Forced mate in {abs(ev['mate_in'])} for Black!")
            else:
                cp = ev["score_cp"] or 0
                if abs(cp) < 25:
                    notes.append("Position is roughly equal")
                elif abs(cp) < 75:
                    advantage = "White" if cp > 0 else "Black"
                    notes.append(f"Slight advantage for {advantage}")
                elif abs(cp) < 200:
                    advantage = "White" if cp > 0 else "Black"
                    notes.append(f"Clear advantage for {advantage}")
                else:
                    advantage = "White" if cp > 0 else "Black"
                    notes.append(f"Decisive advantage for {advantage}")

        # Collect all strategic observations
        for color in [chess.WHITE, chess.BLACK]:
            c = "White" if color == chess.WHITE else "Black"
            pawns = analysis["pawn_structure"][c.lower()]
            pieces = analysis["piece_activity"][c.lower()]
            king = analysis["king_safety"][c.lower()]

            for note in pawns["notes"] + pieces["notes"] + king["notes"]:
                notes.append(f"[{c}] {note}")

        # Plans for the side to move
        plans = []
        if candidates:
            best_move = candidates[0]["move"]
            best_line = candidates[0]["line"]
            plans.append(f"Best plan: {best_move} ({best_line})")

            if len(candidates) > 1:
                alt = candidates[1]
                diff = 0
                if candidates[0]["eval"]["score_cp"] and alt["eval"]["score_cp"]:
                    diff = abs(candidates[0]["eval"]["score_cp"] - alt["eval"]["score_cp"])
                if diff < 30:
                    plans.append(
                        f"Alternative: {alt['move']} is almost equally good ({alt['eval']['eval_str']})"
                    )

        notes.extend(plans)
        return notes

    def _print_analysis(self, board, analysis):
        """Pretty-print the analysis."""
        side = "White" if board.turn == chess.WHITE else "Black"

        print(f"\n{'=' * 70}")
        print(f"  POSITION COACH — {side} to move")
        print(f"  FEN: {board.fen()}")
        print(f"{'=' * 70}")

        # Candidate moves
        print(f"\n  CANDIDATE MOVES")
        print(f"  {'-' * 60}")
        for c in analysis["candidates"]:
            marker = " >> " if c["rank"] == 1 else "    "
            print(f"{marker}{c['rank']}. {c['move']:8s} [{c['eval']['eval_str']:>7s}]  {c['line']}")

        # Strategic assessment
        print(f"\n  STRATEGIC ASSESSMENT")
        print(f"  {'-' * 60}")
        for note in analysis["assessment"]:
            print(f"    {note}")

        # Tactics
        if analysis["tactics"]:
            print(f"\n  TACTICAL MOTIFS")
            print(f"  {'-' * 60}")
            for t in analysis["tactics"][:10]:
                print(f"    {t}")

        print(f"\n{'=' * 70}\n")

    def analyze_game(self, pgn_text, move_number=None, player_name=None):
        """
        Analyze a specific position from a game.

        Args:
            pgn_text: PGN string
            move_number: Which move to analyze (None = final position)
            player_name: Player name for auto-detecting side
        """
        game = chess.pgn.read_game(io.StringIO(pgn_text))
        if game is None:
            print("Error: Could not parse PGN")
            return

        board = game.board()
        target_ply = (move_number * 2 - 1) if move_number else None

        ply = 0
        for node in game.mainline():
            board.push(node.move)
            ply += 1
            if target_ply and ply >= target_ply:
                break

        return self.analyze(board)

    def interactive_mode(self):
        """Run in interactive mode — enter FEN positions and get analysis."""
        print("\nChess Position Coach — Interactive Mode")
        print("Enter a FEN position or type 'quit' to exit.\n")

        while True:
            try:
                fen = input("FEN> ").strip()
            except (EOFError, KeyboardInterrupt):
                break

            if fen.lower() in ("quit", "exit", "q"):
                break
            if not fen:
                continue

            try:
                board = chess.Board(fen)
            except ValueError as e:
                print(f"Invalid FEN: {e}")
                continue

            self.analyze(board)

    def cleanup(self):
        """Shut down the engine."""
        self.engine.quit()


def main():
    parser = argparse.ArgumentParser(
        description="Chess Position Coach — Master-level position explanations",
    )

    # Input
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--fen", help="FEN position to analyze")
    source.add_argument("--moves", help="Moves in SAN notation from starting position")
    source.add_argument("--pgn", metavar="FILE", help="PGN file to analyze")
    source.add_argument("--interactive", action="store_true", help="Interactive mode")

    # Options
    parser.add_argument("--move-number", type=int, help="Which move to analyze (for --pgn)")
    parser.add_argument("--depth", type=int, default=25, help="Analysis depth (default: 25)")
    parser.add_argument("--stockfish-path", default="/opt/homebrew/bin/stockfish")

    args = parser.parse_args()

    coach = PositionCoach(
        stockfish_path=args.stockfish_path,
        analysis_depth=args.depth,
    )

    try:
        if args.interactive or (not args.fen and not args.moves and not args.pgn):
            coach.interactive_mode()
        elif args.fen:
            board = chess.Board(args.fen)
            coach.analyze(board)
        elif args.moves:
            board = chess.Board()
            for san in args.moves.split():
                board.push_san(san)
            coach.analyze(board)
        elif args.pgn:
            with open(args.pgn) as f:
                pgn_text = f.read()
            coach.analyze_game(pgn_text, move_number=args.move_number)
    finally:
        coach.cleanup()


if __name__ == "__main__":
    main()
