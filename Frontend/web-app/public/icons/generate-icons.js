const fs = require('fs');
const path = require('path');

// Simple base64 encoded PNG for a basic icon (transparent background with blue circle)
const createSimpleIcon = (size) => {
  // Using canvas to create a simple icon
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#0066cc';
  ctx.fillRect(0, 0, size, size);
  
  // White circle
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Letter "M" for Marketplace
  ctx.fillStyle = '#0066cc';
  ctx.font = `bold ${size / 2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', size / 2, size / 2);
  
  return canvas.toBuffer('image/png');
};

// Generate icons only if canvas is available
try {
  require.resolve('canvas');
  
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  sizes.forEach(size => {
    const buffer = createSimpleIcon(size);
    const filename = path.join(__dirname, `icon-${size}x${size}.png`);
    fs.writeFileSync(filename, buffer);
    console.log(`✓ Created ${filename}`);
  });
  
  console.log('\n✓ All icons generated successfully!');
} catch (err) {
  console.error('Canvas module not found. Creating fallback icons...');
  
  // Fallback: Create minimal 1x1 transparent PNG as placeholder
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);
  
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  sizes.forEach(size => {
    const filename = path.join(__dirname, `icon-${size}x${size}.png`);
    fs.writeFileSync(filename, minimalPNG);
    console.log(`✓ Created placeholder ${filename}`);
  });
  
  console.log('\n⚠ Created minimal placeholder icons. Install "canvas" package for better icons:');
  console.log('  npm install canvas --save-dev');
}
