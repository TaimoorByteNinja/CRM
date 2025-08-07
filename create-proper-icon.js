const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

console.log('🎨 Creating Craft CRM icon...');

// Create a 256x256 canvas
const canvas = createCanvas(256, 256);
const ctx = canvas.getContext('2d');

// Clear canvas with transparent background
ctx.clearRect(0, 0, 256, 256);

// Draw blue background with rounded corners (#2563eb)
ctx.fillStyle = '#2563eb';
ctx.beginPath();
ctx.roundRect(0, 0, 256, 256, 45);
ctx.fill();

// Draw white rotated square border in center
ctx.save();
ctx.translate(128, 128); // Move to center of canvas
ctx.rotate((12 * Math.PI) / 180); // Rotate 12 degrees

// White square outline
ctx.strokeStyle = 'white';
ctx.lineWidth = 16; // Thick border for visibility at 256x256
ctx.beginPath();
ctx.rect(-40, -40, 80, 80); // 80x80 square centered on origin
ctx.stroke();

ctx.restore();

// Save the PNG
const buffer = canvas.toBuffer('image/png');
const iconPath = path.join(__dirname, 'assets', 'craft-crm-icon.png');

fs.writeFileSync(iconPath, buffer);

console.log('✅ Craft CRM icon created successfully at:', iconPath);
console.log('📏 Icon size: 256x256 PNG');
console.log('🎨 Design: Blue background (#2563eb) with white rotated square border');
console.log('🔄 Now restart your Electron app to see the new icon!');
