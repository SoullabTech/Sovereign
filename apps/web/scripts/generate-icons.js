/**
 * Generate PWA icons with Canvas
 * Run: node scripts/generate-icons.js
 */
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon and save as files
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG for each size
sizes.forEach(size => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Golden background -->
  <rect width="${size}" height="${size}" fill="#FFD700" rx="${size * 0.15}"/>

  <!-- Dark blue circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="#0A0D16" opacity="0.9"/>

  <!-- Letter S -->
  <text
    x="${size/2}"
    y="${size/2 + size * 0.15}"
    font-family="Arial, sans-serif"
    font-size="${size * 0.4}"
    font-weight="bold"
    fill="#FFD700"
    text-anchor="middle">S</text>
</svg>`;

  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`✓ Generated ${filename}`);
});

console.log('\n✅ All PWA icons generated successfully!');
console.log(`Icons location: ${iconsDir}`);