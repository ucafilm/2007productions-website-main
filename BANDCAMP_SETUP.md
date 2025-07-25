# Bandcamp Player Setup for Collin's Page

## Overview
A Bandcamp music player has been integrated into Collin's page that allows visitors to:
- **Listen to his album** directly on the site
- **Buy the digital album** with a direct link to Bandcamp

## Quick Setup

## Quick Setup for Collin's "Lost Motel" Album

### Step 1: Get the Album ID
1. **Visit Collin's album page**: https://collinbuchanan.bandcamp.com/album/lost-motel
2. **Open browser developer tools** (F12 or right-click → Inspect)
3. **Go to Console tab**
4. **Run this command**:
   ```javascript
   JSON.parse(document.querySelector('meta[name="bc-page-properties"]').content).item_id
   ```
5. **Copy the number** that appears (it will be a long number like 1234567890)

### Step 2: Update the Configuration
1. **Open `script.js`**
2. **Find this line near the bottom**:
   ```javascript
   'NEEDS_ALBUM_ID',  // Replace with actual album ID from console command above
   ```
3. **Replace `'NEEDS_ALBUM_ID'`** with the number from Step 1 (keep the quotes)
4. **Save the file**

### Step 3: Test
1. **Reload the website**
2. **Go to Collin's page**
3. **The player should now show "Lost Motel" and be playable**
4. **The buy button should link to the Bandcamp page**

## Example Configuration

If Collin's album is at `https://collinsbeats.bandcamp.com/album/sonic-landscapes` with ID `3845729105`:

```javascript
window.configureBandcampAlbum(
    '3845729105',
    'https://collinsbeats.bandcamp.com/album/sonic-landscapes',
    'Sonic Landscapes'
);
```

## Features

### 🎵 **Bandcamp Player**
- **Seamless Integration**: Matches the 2007 Productions design
- **Responsive Design**: Works on all devices
- **Hover Effects**: Interactive styling with brand colors
- **Auto-styling**: Uses site's color scheme (orange/blue gradients)

### 🛒 **Buy Button**
- **Direct Purchase Link**: Takes users straight to Bandcamp
- **Animated Hover**: Gradient background animation
- **Mobile Optimized**: Full-width on mobile devices
- **Brand Consistent**: Matches site's button styling

### 🎨 **Design Details**
- **Color Scheme**: Matches 2007 Productions brand
  - Primary: `#ff6b35` (Electric Orange)
  - Secondary: `#4a9eff` (Cyber Blue) 
  - Background: `#0a0a0a` (Deep Black)
- **Typography**: Space Grotesk font family
- **Effects**: Magnetic cursor interaction, hover animations

## Customization Options

### Player Styling
The player appearance can be customized by modifying the `playerConfig` in the `BandcampPlayer` class:

```javascript
this.playerConfig = {
    size: 'large',           // Player size
    bgColor: '0a0a0a',      // Background color (hex without #)
    linkColor: 'ff6b35',    // Link color (hex without #)
    tracklist: false,       // Show/hide tracklist
    artwork: 'small',       // Artwork size
    transparent: true       // Transparent background
};
```

### Buy Button Text
To change the button text, modify this line in `index.html`:
```html
<span>Buy Digital Album</span>  <!-- Change this text -->
```

## Troubleshooting

### **Player Not Loading**
- Verify the album ID is correct (10+ digit number)
- Check the Bandcamp URL is accessible
- Ensure `configureBandcampAlbum()` is called after page load

### **Buy Button Not Working**
- Confirm the Bandcamp URL is correct and accessible
- Check browser console for JavaScript errors
- Verify the button element has the correct ID (`buyAlbumBtn`)

### **Styling Issues**
- Clear browser cache and reload
- Check that `style.css` includes the Bandcamp player styles
- Verify CSS custom properties are defined

## Mobile Optimization

The player is fully responsive:
- **Desktop**: Side-by-side layout with hover effects
- **Tablet**: Stacked layout with simplified effects  
- **Mobile**: Full-width design with touch-friendly buttons

## Performance

- **Lazy Loading**: Player only loads when Collin's page is viewed
- **Lightweight**: Minimal JavaScript footprint
- **Fast Rendering**: CSS animations use GPU acceleration
- **Efficient**: No external dependencies beyond Bandcamp iframe

## Future Enhancements

Potential additions:
- **Multiple Albums**: Support for album carousel
- **Purchase Analytics**: Track buy button clicks
- **Social Sharing**: Share specific tracks
- **Playlist Integration**: Queue multiple albums

---

**Need help?** The setup should take less than 5 minutes once you have the Bandcamp album ID. The placeholder will show until real album data is configured.
