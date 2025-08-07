// Craft CRM Icon Generation Script
// This script helps you create the necessary icon files for Electron

// You'll need to manually create these files or use online tools:
// 1. Go to https://www.canva.com or any design tool
// 2. Create a 256x256 image with:
//    - Blue background (#2563eb)
//    - Rounded corners (45px radius)
//    - White rotated square in center (border-only, 8px stroke, 12° rotation)
// 3. Save as PNG
// 4. Use online converter to create .ico file
// 5. Place both files in the assets folder

console.log(`
🎨 Craft CRM Icon Creation Guide
================================

1. Create PNG Icon (256x256):
   - Background: Blue (#2563eb)
   - Corner radius: 45px
   - Center: White square outline (8px stroke, rotated 12°)
   - Save as: assets/craft-crm-icon.png

2. Create ICO File:
   - Use online converter (e.g., convertio.co)
   - Convert PNG to ICO format
   - Save as: assets/icon.ico

3. Files needed:
   ✅ assets/craft-crm-icon.png (for Electron window)
   ✅ assets/icon.ico (for Windows builds)
   ✅ assets/craft-crm-logo.svg (already created)

Your logo design matches exactly:
<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
  <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-12"></div>
</div>

Scaled up to 256x256 for the icon.
`);
