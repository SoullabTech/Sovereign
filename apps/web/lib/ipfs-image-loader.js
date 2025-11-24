/**
 * IPFS Image Loader for Next.js
 * Handles image loading from IPFS gateways with fallback support
 */

export default function ipfsImageLoader({ src, width, quality }) {
  // Get IPFS gateway from environment
  const gateway =
    process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud";

  // Handle IPFS hashes
  if (src.startsWith("ipfs://")) {
    const hash = src.replace("ipfs://", "");
    return `${gateway}/ipfs/${hash}?w=${width}&q=${quality || 75}`;
  }

  // Handle relative paths for static export
  if (src.startsWith("/")) {
    // In IPFS mode, convert to relative path
    if (process.env.NEXT_PUBLIC_IPFS_BUILD === "true") {
      return `.${src}`;
    }
    // Otherwise use CDN
    return `${process.env.NEXT_PUBLIC_CDN_URL || ""}${src}`;
  }

  // Return absolute URLs as-is
  return src;
}
