# 🏈 Nebraska Huskers API Proxy

Secure server-side proxy for the Nebraska Huskers Game Sheet Generator. Keeps API keys safe and provides a clean interface for the client application.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API keys:**
   - Copy `.env.example` to `.env`
   - Add your API keys from:
     - College Football Data: https://collegefootballdata.com/key
     - The Odds API: https://the-odds-api.com/

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Test the server:**
   - Health check: http://localhost:3000/api/health
   - API test: http://localhost:3000/api/test

## 📡 API Endpoints

### Core Endpoints
- `GET /` - Server info and documentation
- `GET /api/health` - Health check and status
- `GET /api/test` - Test API connectivity
- `GET /api/stats` - Server statistics

### Data Endpoints
- `GET /api/cfbd/*` - College Football Data API proxy
- `GET /api/odds/*` - The Odds API proxy

### Example Requests
```bash
# Get team stats
curl "http://localhost:3000/api/cfbd/stats/season?year=2024&team=Nebraska"

# Get betting odds
curl "http://localhost:3000/api/odds/sports/americanfootball_ncaaf/odds?regions=us&markets=spreads"
```

## 🛡️ Security Features

- ✅ **API keys stored server-side only**
- ✅ **CORS protection**
- ✅ **Rate limiting (200 requests per 15 minutes)**
- ✅ **Request timeout (10 seconds)**
- ✅ **Helmet.js security headers**
- ✅ **Error handling and logging**

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Railway
```bash
npm i -g @railway/cli
railway login
railway deploy
```

### Docker
```bash
docker build -t huskers-proxy .
docker run -p 3000:3000 --env-file .env huskers-proxy
```

## 📊 Monitoring

The proxy provides several monitoring endpoints:

- **Health**: `/api/health` - Check if APIs are working
- **Test**: `/api/test` - Run connectivity tests
- **Stats**: `/api/stats` - Get server statistics

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CFBD_API_KEY` | Yes | College Football Data API key |
| `ODDS_API_KEY` | Yes | The Odds API key |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |

## 📈 Rate Limits

- **Server**: 200 requests per IP per 15 minutes
- **CFBD API**: 100 requests per minute
- **Odds API**: 500 requests per month (free tier)

## 🐛 Troubleshooting

### "API not configured" errors
- Check your `.env` file has the correct API keys
- Restart the server after adding keys

### CORS errors
- Add your domain to the allowed origins in `server.js`
- Check that your client is making requests to the correct proxy URL

### Rate limit errors
- Wait for the rate limit window to reset
- Consider upgrading to paid API tiers for higher limits

## 📞 Support

- **Documentation**: This README
- **Issues**: Check the console logs
- **Contact**: 2007 Productions

## 📄 License

MIT License - feel free to modify and use for your Nebraska Huskers projects!

---

**Go Big Red!** 🌽
