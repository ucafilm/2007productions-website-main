# Generate PWA Icons

## Temporary Solution

Since the PWA icons are missing and causing manifest errors, here are the options:

### Option 1: Use Online Tool (Recommended)
1. Go to https://progressier.com/pwa-icons-and-ios-splash-screen-generator
2. Upload the `icons/icon-template.svg` file
3. Download the generated icons
4. Replace all icon files in the `/icons` folder

### Option 2: Use Sharp CLI (if Node.js available)
```bash
npm install -g sharp-cli
# Generate each size manually
sharp resize 72 72 --output icons/icon-72x72.png icons/icon-template.svg
sharp resize 96 96 --output icons/icon-96x96.png icons/icon-template.svg
sharp resize 128 128 --output icons/icon-128x128.png icons/icon-template.svg
sharp resize 144 144 --output icons/icon-144x144.png icons/icon-template.svg
sharp resize 152 152 --output icons/icon-152x152.png icons/icon-template.svg
sharp resize 192 192 --output icons/icon-192x192.png icons/icon-template.svg
sharp resize 384 384 --output icons/icon-384x384.png icons/icon-template.svg
sharp resize 512 512 --output icons/icon-512x512.png icons/icon-template.svg
```

### Option 3: Update Manifest to Use SVG
Update manifest.json to use the SVG file directly:

```json
{
  "icons": [
    {
      "src": "icons/icon-512x512.svg",
      "sizes": "72x72 96x96 128x128 144x144 152x152 192x192 384x384 512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

## Current Action
For now, I'll update the manifest to use the existing SVG to prevent errors, then focus on the core functionality issues.
