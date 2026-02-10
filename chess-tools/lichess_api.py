"""
Lichess Explorer API client.

Queries the Lichess opening explorer for move statistics from:
- The Lichess player database (500M+ games, filterable by rating/speed)
- The Masters database (3M+ OTB games from titled players)

Also provides game export and user game download functionality.
"""

import time
import requests

from api_cache import APICache


LICHESS_EXPLORER_BASE = "https://explorer.lichess.ovh"
LICHESS_API_BASE = "https://lichess.org/api"


class LichessExplorer:
    """Client for the Lichess opening explorer API."""

    def __init__(self, api_delay=1.5, api_token=None, cache=None):
        self.api_delay = api_delay
        self.session = requests.Session()
        self.session.headers.update({"Accept": "application/json"})
        if api_token:
            self.session.headers.update({"Authorization": f"Bearer {api_token}"})
        self._last_request_time = 0
        self.cache = cache or APICache()

    def _rate_limit(self):
        """Enforce minimum delay between API requests."""
        elapsed = time.time() - self._last_request_time
        if elapsed < self.api_delay:
            time.sleep(self.api_delay - elapsed)
        self._last_request_time = time.time()

    def _request(self, endpoint, params):
        """Make a rate-limited request with retry on 429 and connection errors."""
        self._rate_limit()
        url = f"{LICHESS_EXPLORER_BASE}/{endpoint}"
        for attempt in range(5):
            try:
                resp = self.session.get(url, params=params, timeout=30)
                if resp.status_code == 429:
                    wait = 60 * (attempt + 1)
                    print(f"  Rate limited (429). Waiting {wait}s...")
                    time.sleep(wait)
                    continue
                resp.raise_for_status()
                return resp.json()
            except (requests.ConnectionError, requests.Timeout) as e:
                wait = 10 * (attempt + 1)
                print(f"  Connection error (attempt {attempt + 1}/5): {e.__class__.__name__}. Retrying in {wait}s...")
                time.sleep(wait)
                continue
        raise RuntimeError(f"Failed after 5 attempts: {url}")

    def get_lichess_moves(self, fen, ratings=None, speeds=None, top_moves=12):
        """
        Query the Lichess player database for a position.

        Args:
            fen: FEN string of the position
            ratings: List of rating groups, e.g. [1600, 1800, 2000, 2200]
            speeds: List of time controls, e.g. ["rapid", "classical"]
            top_moves: Max number of moves to return

        Returns:
            dict with keys: total_games, moves (list of MoveStats)
        """
        params = {
            "variant": "standard",
            "fen": fen,
            "moves": top_moves,
        }
        if ratings:
            params["ratings"] = ",".join(str(r) for r in ratings)
        if speeds:
            params["speeds"] = ",".join(speeds)

        # Check cache first
        cache_key = self.cache.make_key("lichess", params)
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        data = self._request("lichess", params)
        result = self._parse_response(data)
        self.cache.set(cache_key, result)
        return result

    def get_masters_moves(self, fen, top_moves=12):
        """
        Query the Masters database for a position.

        Args:
            fen: FEN string of the position
            top_moves: Max number of moves to return

        Returns:
            dict with keys: total_games, moves (list of MoveStats)
        """
        params = {
            "fen": fen,
            "moves": top_moves,
        }

        cache_key = self.cache.make_key("masters", params)
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        data = self._request("masters", params)
        result = self._parse_response(data)
        self.cache.set(cache_key, result)
        return result

    def _parse_response(self, data):
        """Parse the explorer API response into structured data."""
        total_white = data.get("white", 0)
        total_draws = data.get("draws", 0)
        total_black = data.get("black", 0)
        total_games = total_white + total_draws + total_black

        moves = []
        for m in data.get("moves", []):
            white = m.get("white", 0)
            draws = m.get("draws", 0)
            black = m.get("black", 0)
            games = white + draws + black
            if games == 0:
                continue

            score_white = (white + draws * 0.5) / games * 100
            score_black = (black + draws * 0.5) / games * 100

            moves.append({
                "san": m["san"],
                "uci": m["uci"],
                "games": games,
                "white_wins": white,
                "draws": draws,
                "black_wins": black,
                "score_white": round(score_white, 1),
                "score_black": round(score_black, 1),
                "avg_rating": m.get("averageRating", 0),
                "frequency": round(games / total_games * 100, 1) if total_games > 0 else 0,
            })

        return {
            "total_games": total_games,
            "moves": moves,
        }

    def download_user_games(self, username, max_games=50, speeds=None,
                            rated_only=True, with_evals=True, with_opening=True):
        """
        Download a user's recent games from Lichess in PGN format.

        Args:
            username: Lichess username
            max_games: Maximum number of games to download
            speeds: List of time controls (e.g., ["rapid", "classical"])
            rated_only: Only include rated games
            with_evals: Include computer evaluations if available
            with_opening: Include opening information

        Returns:
            PGN string containing all games
        """
        self._rate_limit()
        url = f"{LICHESS_API_BASE}/games/user/{username}"
        params = {
            "max": max_games,
            "rated": str(rated_only).lower(),
            "evals": str(with_evals).lower(),
            "opening": str(with_opening).lower(),
        }
        if speeds:
            params["perfType"] = ",".join(speeds)

        headers = {**self.session.headers, "Accept": "application/x-chess-pgn"}
        resp = self.session.get(url, params=params, headers=headers, timeout=60)
        resp.raise_for_status()
        self._last_request_time = time.time()
        return resp.text
