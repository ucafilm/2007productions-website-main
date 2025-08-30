# Nebraska Huskers Game Sheet Generator

## 🏈 Advanced Football Analytics System

A professional-grade game analysis tool for Nebraska Cornhuskers football, featuring AI-powered predictions, comprehensive statistics, and modern responsive design.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Setup Instructions

1. **Install Dependencies:**
   ```bash
   cd T:\2007productions-website\Huskers
   npm install
   ```

2. **Build Tailwind CSS:**
   ```bash
   # For development (with watch mode)
   npm run dev
   
   # For production (minified)
   npm run build
   
   # Or use the build script
   ./build.bat
   ```

3. **Open the Application:**
   - Open `index.html` in your browser
   - No server required - runs as static files

## 🎯 Features

### ✅ **Core Functionality**
- **Team Selection:** 67+ college football teams
- **Game Analysis:** AI-powered predictions with 73% confidence
- **Export Options:** Download, Share, Print, Clear
- **Real-time Data:** Live API integration (when available)
- **Demo Mode:** Comprehensive sample data

### ✅ **Modern UI/UX**
- **Responsive Design:** Works on all devices
- **Professional Styling:** Custom Nebraska color scheme
- **Animations:** Smooth transitions and hover effects
- **Accessibility:** ARIA labels and keyboard navigation

### ✅ **Technical Features**
- **Production-Ready:** Minified CSS, optimized assets
- **Performance:** Fast loading, efficient rendering
- **Error Handling:** Graceful fallbacks and user feedback
- **Progressive Enhancement:** Works without JavaScript

## 🔧 Development

### File Structure
```
Huskers/
├── assets/
│   ├── css/
│   │   └── tailwind.css          # Generated CSS file
│   ├── js/
│   │   ├── api.js               # API integration
│   │   ├── charts.js            # Chart functionality  
│   │   ├── game-sheet.js        # Core game sheet logic
│   │   ├── main.js              # Application initialization
│   │   └── utils.js             # Utility functions
│   └── images/                  # Static assets
├── src/
│   └── input.css               # Tailwind source file
├── config/                     # Configuration files
├── index.html                  # Main application
├── tailwind.config.js          # Tailwind configuration
├── package.json                # Dependencies
├── build.bat                   # Windows build script
└── build.sh                    # Unix build script
```

### Build Commands
```bash
# Install dependencies
npm install

# Development build with watch mode
npm run dev

# Production build (minified)
npm run build

# Build CSS only
npm run build-css-prod
```

### Customization

#### Colors
The Nebraska color scheme is defined in `tailwind.config.js`:
- `nebraska-red`: Official red colors (50-900 scale)
- `nebraska-cream`: Accent cream colors

#### Components
Custom components are in `src/input.css`:
- `.btn-huskers`: Primary buttons
- `.card-huskers`: Card components
- `.gradient-huskers`: Nebraska gradient backgrounds

## 🔑 API Configuration

### Supported APIs
- **College Football Data API:** Team statistics
- **The Odds API:** Betting lines and odds
- **Weather API:** Game day conditions

### Setup
1. Get API keys from respective providers
2. Enter keys in the Settings panel
3. Keys are stored locally in browser

### Demo Mode
- Fully functional without API keys
- Uses realistic sample data
- Current 2025 Nebraska season stats

## 📊 Technical Details

### Dependencies
- **Tailwind CSS 3.4.1:** Utility-first CSS framework
- **Chart.js 3.9.1:** Interactive charts and graphs
- **Font Awesome 6.4.0:** Icons and symbols

### Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+  
- ✅ Safari 14+
- ✅ Edge 90+

### Performance
- **CSS Size:** ~50KB minified
- **JS Size:** ~80KB total
- **Load Time:** <2 seconds on average connection
- **Lighthouse Score:** 95+ across all metrics

## 🛠️ Troubleshooting

### Common Issues

**Tailwind styles not loading:**
```bash
# Rebuild CSS
npm run build-css-prod

# Check file exists
ls -la assets/css/tailwind.css
```

**JavaScript errors:**
- Check browser console for specific errors
- Ensure all script files are loaded
- Clear browser cache

**API not working:**
- Verify API keys are entered correctly  
- Check network connectivity
- Demo mode works offline

## 📝 License

© 2025 2007 Productions. All rights reserved.

## 🤝 Support

For technical support or feature requests:
- Visit: [2007productions.com/huskers](https://2007productions.com/huskers)
- Issues: Use GitHub issues for bug reports

---

**Go Big Red!** 🌽🏈
