"""
API result cache.

Caches Lichess Explorer API responses locally in a SQLite database
so repeated queries (e.g., re-running repertoire generation) are instant.
"""

import json
import os
import sqlite3
import time


class APICache:
    """SQLite-backed cache for API responses."""

    def __init__(self, cache_dir=None, ttl_hours=24):
        """
        Initialize the cache.

        Args:
            cache_dir: Directory to store the cache DB. Defaults to ~/.chess-tools/
            ttl_hours: Cache entries expire after this many hours
        """
        if cache_dir is None:
            cache_dir = os.path.join(os.path.expanduser("~"), ".chess-tools")
        os.makedirs(cache_dir, exist_ok=True)

        self.db_path = os.path.join(cache_dir, "api_cache.db")
        self.ttl_seconds = ttl_hours * 3600
        self.conn = sqlite3.connect(self.db_path)
        self._init_db()
        self._hits = 0
        self._misses = 0

    def _init_db(self):
        """Create the cache table if it doesn't exist."""
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS cache (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                created_at REAL NOT NULL
            )
        """)
        self.conn.commit()

    def get(self, key):
        """
        Get a cached value. Returns None if not found or expired.

        Args:
            key: Cache key string

        Returns:
            Parsed JSON value or None
        """
        row = self.conn.execute(
            "SELECT value, created_at FROM cache WHERE key = ?", (key,)
        ).fetchone()

        if row is None:
            self._misses += 1
            return None

        value, created_at = row
        if time.time() - created_at > self.ttl_seconds:
            # Expired — delete and return None
            self.conn.execute("DELETE FROM cache WHERE key = ?", (key,))
            self.conn.commit()
            self._misses += 1
            return None

        self._hits += 1
        return json.loads(value)

    def set(self, key, value):
        """
        Store a value in the cache.

        Args:
            key: Cache key string
            value: JSON-serializable value
        """
        self.conn.execute(
            "INSERT OR REPLACE INTO cache (key, value, created_at) VALUES (?, ?, ?)",
            (key, json.dumps(value), time.time()),
        )
        self.conn.commit()

    def make_key(self, endpoint, params):
        """
        Create a consistent cache key from an endpoint and parameters.

        Args:
            endpoint: API endpoint string (e.g., "lichess", "masters")
            params: Dict of query parameters

        Returns:
            Cache key string
        """
        sorted_params = sorted(params.items())
        param_str = "&".join(f"{k}={v}" for k, v in sorted_params)
        return f"{endpoint}?{param_str}"

    @property
    def stats(self):
        """Return cache hit/miss statistics."""
        total = self._hits + self._misses
        rate = (self._hits / total * 100) if total > 0 else 0
        return {
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": f"{rate:.0f}%",
        }

    def clear(self):
        """Clear all cache entries."""
        self.conn.execute("DELETE FROM cache")
        self.conn.commit()

    def size(self):
        """Return number of cached entries."""
        row = self.conn.execute("SELECT COUNT(*) FROM cache").fetchone()
        return row[0]

    def close(self):
        """Close the database connection."""
        self.conn.close()
