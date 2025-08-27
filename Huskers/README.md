# Nebraska Huskers Advanced Game Sheet Generator

A comprehensive, automated Nebraska football game analysis system with real-time statistics, interactive visualizations, and professional reporting capabilities.

## 🏈 Features

### Core Functionality
- **Real-Time Data Integration**: College Football Data API, The Odds API, ESPN APIs
- **Advanced Analytics**: EPA, Success Rate, FPI ratings, Explosive Play metrics
- **Interactive Visualizations**: Radar charts, trend analysis, efficiency comparisons
- **Comprehensive Statistics**: Team stats, player grades, injury reports
- **Betting Intelligence**: Live lines, movement tracking, prop bets
- **Historical Analysis**: All-time records, recent matchups, common opponents
- **Professional Reports**: Downloadable analysis with charts and insights

### Advanced Features
- **Automated Generation**: Set up scheduled creation before each game
- **Multiple Export Formats**: Text, PDF (future), JSON data
- **Mobile Responsive**: Works on all devices
- **Caching System**: Reduced API calls, improved performance
- **Error Handling**: Graceful fallbacks to demo data
- **Keyboard Shortcuts**: Quick navigation and generation

## 🚀 Quick Start

### 1. File Structure
```
Huskers/
├── index.html              # Main application
├── assets/
│   ├── css/
│   │   └── huskers.css     # Custom styling
│   ├── js/
│   │   ├── config.js       # Configuration
│   │   ├── api.js          # API handlers
│   │   ├── charts.js       # Chart generation
│   │   ├── game-sheet.js   # Main generator
│   │   └── main.js         # Application init
│   └── images/             # Assets folder
├── config/                 # Additional configs
└── README.md              # This file
```

### 2. API Keys Required

#### College Football Data API (Free)
1. Visit https://collegefootballdata.com/key
2. Create account and generate API key
3. Provides: Team stats, player data, historical records

#### The Odds API (Free Tier: 500 requests/month)
1. Visit https://the-odds-api.com/
2. Sign up for free account
3. Provides: Live betting lines, spreads, props

#### ESPN API (No key required)
- Unofficial endpoints for additional data
- Used as backup data source

### 3. Setup Instructions

1. **Deploy Files**: Upload all files to your web server at `/huskers/`

2. **Configure API Keys**: 
   - Open the website
   - Enter API keys in the configuration panel
   - Keys are securely stored in browser localStorage

3. **Test Generation**:
   - Enter opponent: "Cincinnati"
   - Set date: "2025-08-28"
   - Click "Generate Game Sheet"

4. **Verify Functionality**:
   - ✅ Live data loads (with API keys)
   - ✅ Charts render correctly
   - ✅ Download report works
   - ✅ Mobile responsive

## 📊 Data Sources

### Primary APIs
- **College Football Data API**: Official college football statistics
- **The Odds API**: Live betting lines from major sportsbooks
- **ESPN API**: Scores, schedules, team information

### Data Categories
- **Team Statistics**: Offense, defense, special teams
- **Advanced Metrics**: EPA, success rates, efficiency
- **Player Data**: Individual stats, grades, injury status
- **Betting Lines**: Spreads, totals, moneylines, props
- **Historical Data**: All-time records, recent meetings

## 🎯 Usage

### Basic Usage
1. Enter opponent team name
2. Select game date
3. Choose season year
4. Click "Generate Game Sheet"

### Advanced Features
- **Keyboard Shortcuts**: Ctrl+G (generate), Ctrl+D (download)
- **URL Parameters**: Direct links to specific matchups
- **Auto-generation**: From URL parameters or saved data
- **Print Optimization**: Clean layout for physical reports

### API Integration
```javascript
// Quick generation via JavaScript
huskersUtils.generateQuickReport('Cincinnati', '2025-08-28');

// Export settings
huskersUtils.exportSettings();

// Clear all data
huskersUtils.clearAllData();
```

## 🛠 Configuration

### config.js Settings
```javascript
// Modify these for your needs
REFRESH_INTERVALS: {
    live_game: 30000,      // 30 seconds
    pre_game: 300000,      // 5 minutes
    off_season: 3600000    // 1 hour
},

FEATURES: {
    live_betting_lines: true,
    injury_reports: true,
    advanced_charts: true,
    historical_analysis: true,
    weather_data: true
}
```

### Customization Options
- **Team Colors**: Modify Nebraska branding
- **Chart Types**: Add/remove visualization types
- **Data Sources**: Configure API endpoints
- **Export Formats**: Add PDF, Excel support
- **Cache Settings**: Adjust refresh intervals

## 🔧 Development

### Prerequisites
- Modern web browser with ES6+ support
- Web server (for CORS and localStorage)
- API keys for live data

### Development Mode
```javascript
// Enable debug mode
CONFIG.DEV.debug_mode = true;
CONFIG.DEV.log_api_calls = true;

// Access debug objects
console.log(window.DEBUG.api);
console.log(window.DEBUG.charts);
```

### Adding New Features
1. **New Data Source**: Extend `api.js`
2. **New Chart Type**: Add to `charts.js`
3. **New Section**: Update `game-sheet.js`
4. **New Styling**: Modify `huskers.css`

## 📈 Performance

### Optimization Features
- **Caching**: 5-minute default cache for API calls
- **Lazy Loading**: Charts load after DOM ready
- **Debounced Inputs**: Reduced unnecessary calls
- **Error Recovery**: Graceful fallbacks to demo data

### Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (limited support)

## 🚨 Troubleshooting

### Common Issues

**"Demo Mode" showing despite API keys**
- Verify API keys are correctly entered
- Check browser console for error messages
- Ensure CORS is properly configured

**Charts not rendering**
- Verify Chart.js is loaded
- Check for JavaScript errors
- Ensure containers exist in DOM

**API rate limits exceeded**
- College Football Data: 100 requests/minute
- The Odds API: 500 requests/month (free)
- Implement caching to reduce calls

**Mobile display issues**
- Test responsive breakpoints
- Verify Tailwind CSS is loaded
- Check viewport meta tag

### Debug Information
```javascript
// Get system status
console.log(huskersUtils.getApiStats());

// Clear cache
window.DEBUG.api.clearCache();

// Regenerate charts
window.DEBUG.charts.destroyAllCharts();
```

## 📧 Deployment

### Production Checklist
- [ ] API keys configured
- [ ] All files uploaded to `/huskers/`
- [ ] HTTPS enabled (required for some APIs)
- [ ] Error logging configured
- [ ] Performance monitoring enabled
- [ ] Backup/restore procedures documented

### Automation Options
1. **Scheduled Generation**: Cron jobs for game weeks
2. **Email Reports**: Send completed sheets to staff
3. **Social Sharing**: Auto-post to social media
4. **PDF Generation**: Server-side PDF creation
5. **Data Archiving**: Historical report storage

## 🤝 Contributing

### Feature Requests
- New data sources integration
- Additional chart types
- Enhanced mobile experience
- PDF export functionality
- Social sharing capabilities

### Bug Reports
- Include browser/OS information
- Provide console error messages
- Describe steps to reproduce
- Include screenshot if relevant

## 📄 License

This project is created for Nebraska Huskers fans and 2007 Productions. 

### Usage Rights
- ✅ Personal use
- ✅ Educational purposes  
- ✅ Nebraska fan communities
- ❌ Commercial redistribution
- ❌ Competing products

## 🎓 Credits

**Development**: 2007 Productions  
**Data Sources**: College Football Data, The Odds API, ESPN  
**Framework**: Vanilla JavaScript, Chart.js, Tailwind CSS  
**Icons**: Font Awesome  

---

## 🏆 Go Big Red!

*Built with passion for Nebraska Huskers football. Every Saturday matters.*

**Support**: For technical support or feature requests, contact 2007 Productions.

**Website**: https://www.2007productions.com/huskers
