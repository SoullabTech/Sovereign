const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '../../../public/holoflower.png');
const outputPath = path.join(__dirname, '../../../public/holoflower-amber.png');

async function createAmberHoloflower() {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    const { data, info } = await sharp(inputPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = new Uint8ClampedArray(data);

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      pixels[i] = Math.round((gray / 255) * 212);
      pixels[i + 1] = Math.round((gray / 255) * 184);
      pixels[i + 2] = Math.round((gray / 255) * 150);
    }

    await sharp(Buffer.from(pixels), {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
      .png()
      .toFile(outputPath);

    console.log('✅ Created amber holoflower at:', outputPath);
  } catch (error) {
    console.error('❌ Error creating amber holoflower:', error);
  }
}

createAmberHoloflower();