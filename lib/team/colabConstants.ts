// Client-safe Co-Lab constants. Kept free of server imports (no `pg`) so client
// components can import the cookie name without pulling the DB layer into the bundle.

/** Cookie holding the member's current Co-Lab workspace (a studio_teams id). */
export const COLAB_TEAM_COOKIE = 'colab_team_id';
