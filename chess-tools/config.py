"""
Default configuration for the Chess Repertoire Generator.

Defaults are tuned for a ~1200 player aiming to improve toward master level.
"""


DEFAULTS = {
    # Side to build repertoire for
    "side": "white",

    # Lichess database filters
    "ratings": [1600, 1800, 2000, 2200],
    "speeds": ["rapid", "classical"],

    # Tree termination
    "min_games": 500,           # Stop exploring when fewer games than this
    "cumulative_freq": 0.80,    # Cover this % of opponent responses
    "max_depth": 30,            # Max half-moves deep (15 full moves)

    # Stockfish
    "stockfish_path": "/opt/homebrew/bin/stockfish",
    "stockfish_depth": 25,      # Analysis depth (25 = good quality, reasonable speed)
    "stockfish_hash": 256,      # Hash table size in MB
    "stockfish_threads": 4,     # Number of CPU threads

    # Opening book
    "book_path": None,          # Path to .bin Polyglot book (optional)
    "book_min_weight": 0,       # Minimum book weight to include

    # API
    "api_delay": 1.5,           # Seconds between Lichess API requests
    "api_token": None,          # Lichess API token (optional, for higher rate limits)

    # Output
    "output": "repertoire.pgn",
}


def print_config(config):
    """Print the active configuration in a readable format."""
    print("\n" + "=" * 60)
    print("  CHESS REPERTOIRE GENERATOR — Configuration")
    print("=" * 60)
    print(f"  Side:              {config['side']}")
    print(f"  Ratings:           {config['ratings']}")
    print(f"  Speeds:            {config['speeds']}")
    print(f"  Min games:         {config['min_games']:,}")
    print(f"  Cumulative freq:   {config['cumulative_freq'] * 100:.0f}%")
    print(f"  Max depth:         {config['max_depth']} half-moves")
    print(f"  Stockfish depth:   {config['stockfish_depth']}")
    print(f"  Stockfish path:    {config['stockfish_path']}")
    print(f"  Opening book:      {config['book_path'] or 'None'}")
    print(f"  API delay:         {config['api_delay']}s")
    print(f"  Output:            {config['output']}")
    print("=" * 60 + "\n")
