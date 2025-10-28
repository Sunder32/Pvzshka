const fs = require('fs');
const path = require('path');

// Read the 192x192 icon
const sourceIcon = path.join(__dirname, 'icons', 'icon-192x192.png');
const destIcon = path.join(__dirname, 'icon.png');

if (fs.existsSync(sourceIcon)) {
  fs.copyFileSync(sourceIcon, destIcon);
  console.log('✓ Created icon.png');
} else {
  console.error('✗ Source icon not found:', sourceIcon);
}
