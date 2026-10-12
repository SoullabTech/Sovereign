/* Test-only CSS module mapping; class names are stable, no styling is simulated. */
module.exports = new Proxy({}, { get: (_, key) => typeof key === "string" ? key : undefined });
