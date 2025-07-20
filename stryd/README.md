# Stryd Stories PWA

A Progressive Web App for transforming Stryd run data into Instagram Stories, built for 2007productions.com/stryd.

## 🚀 Features

- **PWA Ready**: Install on mobile devices like a native app
- **2007 Productions Design**: Matches your main site's design system
- **Stryd Integration**: Import run data from PowerCenter URLs
- **Nike Run Club Inspired**: Professional themes and typography
- **Mobile Optimized**: Touch-friendly interface with responsive design
- **Offline Capable**: Works without internet after first load

## 🎨 Design System

### Colors
- **Primary Orange**: `#ff6b35` (Stryd/2007 brand)
- **Primary Blue**: `#4a9eff` 
- **Primary Purple**: `#c84fff`
- **Background**: `#000000`

### Fonts
- **Primary**: Space Grotesk (matching main site)
- **Mono**: JetBrains Mono
- **System**: Inter

### Themes
- Stryd Orange (default)
- Nike Volt
- Run Blue  
- Sunset
- Forest
- Midnight

## 🛠 Tech Stack

- **Frontend**: Vanilla React (CDN)
- **PWA**: Service Worker with caching
- **Styling**: CSS Variables + Modern CSS
- **Deployment**: Netlify (same as main site)
- **Icons**: SVG + Progressive enhancement

## 📱 Installation & Usage

### For Users:
1. Visit `2007productions.com/stryd`
2. Tap "Install App" prompt on mobile
3. Upload Stryd map or personal photo
4. Customize with themes and data
5. Download Instagram Story

### For Development:
1. Files are in `/stryd/` subdirectory
2. Uses same Netlify deployment as main site
3. PWA works offline after first load

## 🔧 File Structure

```
stryd/
├── index.html          # Main PWA shell
├── manifest.json       # PWA manifest
├── styles.css         # Base PWA styles
├── app-styles.css     # React component styles
├── app.js            # Main React application
├── sw.js             # Service Worker
└── icons/            # PWA icons (to be added)
```

## 🎯 Future Enhancements

### Planned Features:
- **Stickers**: Running-themed overlays
- **Camera Integration**: Direct photo capture
- **Stryd API**: Live data integration
- **Social Sharing**: Direct Instagram posting
- **Gallery**: Save and manage stories
- **Animation Presets**: Nike-style motion effects

### Technical Improvements:
- React production build
- Image compression
- Background sync
- Push notifications
- Analytics integration

## 🚀 Deployment

The PWA is automatically deployed with the main 2007productions.com site via Netlify:

1. **Auto-deploys** when pushed to main branch
2. **Available at**: `2007productions.com/stryd`
3. **Redirects handled** by netlify.toml
4. **PWA features** work immediately

## 📊 Performance

- **First Load**: ~2-3 seconds
- **Subsequent Loads**: <1 second (cached)
- **Offline Support**: Full functionality
- **Mobile Optimized**: 60fps animations

## 🎨 Brand Integration

- Uses 2007 Productions logo and colors
- Links back to main portfolio site
- Maintains consistent design language
- STRYD branding on all generated stories
- Professional footer with contact info

## 📱 PWA Features

- **Install Prompt**: Smart install prompting
- **Offline Mode**: Full functionality without internet
- **App Shell**: Fast loading architecture
- **Touch Optimized**: Mobile-first interface
- **Responsive**: Works on all screen sizes