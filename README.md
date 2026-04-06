# 🎯 Real-Time Automated Prediction & Tracking Dashboard

A fully responsive, real-time automated prediction and financial tracking dashboard. Works seamlessly on phones, tablets, and computers.

## ✨ Features

### 🔮 Prediction Engine
- Multiple prediction strategies (Random, Opposite, Pattern-based, Smart AI)
- Confidence percentage display
- Automatic WIN/LOSS determination
- Pattern analysis from trade history

### 💰 Financial Management
- Real-time balance tracking
- Profit/Loss calculation
- Level-based Martingale strategy
- Bet progression system
- Initial balance: $5,000 (configurable)

### ⏱️ Automated System
- 60-second countdown timer
- Auto-period generation every minute
- Continuous background execution
- No manual input required

### 📊 Dashboard Features
- Period number display
- Timer with progress bar
- Real-time prediction & result
- Status indicator (WIN/LOSS)
- Current level & bet amount
- Statistics (Wins, Losses, Win Rate)
- Trade history (last 20 trades)

### 📱 Responsive Design
- **Mobile optimized** (< 480px)
- **Tablet friendly** (480px - 1024px)
- **Desktop optimized** (> 1024px)
- Touch-friendly controls
- Beautiful dark theme with gradient accents

### 🔌 API Integration
- Ready for external API connection
- Fallback simulated results
- Error handling & reconnection
- API status indicator
- Supports GET requests

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/Lola2580/prediction-dashboard.git
cd prediction-dashboard
```

### 2. Open in Browser
```bash
# Option A: Direct file
open index.html

# Option B: Local server (Python 3)
python -m http.server 8000
# Visit: http://localhost:8000

# Option C: Local server (Node.js)
npx http-server
```

### 3. Configure API

Edit `app.js` and update:

```javascript
const CONFIG = {
    API_URL: 'https://your-api-endpoint.com/prediction',
    BASE_NUMBER: 10001,
    INITIAL_BALANCE: 5000,
    INITIAL_BET: 100,
    CYCLE_DURATION: 60,
    BASE_TIME: '05:30'
};
```

Your API should return:
```json
{
    "result": "BIG"  // or "SMALL"
}
```

### 4. Start Dashboard
- Click **Start** button to begin
- Click **Stop** to pause
- Click **Reset** to clear data

## 📁 Project Structure

```
prediction-dashboard/
├── index.html          # HTML structure
├── style.css           # Responsive styling
├── app.js              # JavaScript logic & API integration
├── README.md           # This file
├── API_CONFIG.md       # Detailed API integration guide
└── .github/
    └── workflows/      # CI/CD (optional)
```

## 🔧 Configuration

### Prediction Strategy

Change in `app.js`:

```javascript
CONFIG.PREDICTION_STRATEGY = 'smart'; // Options: 'random', 'opposite', 'pattern', 'smart'
```

### Initial Settings

```javascript
const CONFIG = {
    BASE_NUMBER: 10001,              // Period base
    INITIAL_BALANCE: 5000,           // Starting balance
    INITIAL_BET: 100,                // Starting bet
    CYCLE_DURATION: 60,              // Seconds per cycle
    BASE_TIME: '05:30'               // Reference time (5:30 AM)
};
```

## 🎮 How It Works

### 1. Period Generation
```
Period = 10001 + YYYYMMDD + minutes_since_530AM
Example: 10001 + 20260406 + 240 = 20260406241
```

### 2. Prediction Cycle
```
Timer (60s) → Generate Period → Make Prediction → Fetch API Result → Process Result → Update Balance
```

### 3. Martingale Strategy
```
WIN:  Level = 1, Bet = $100
LOSS: Level++, Bet = $100 × 2^(Level-1)
Example: Loss → $200, Loss → $400, Loss → $800, Win → Reset to $100
```

### 4. Financial Tracking
```
Balance = Initial + All Wins - All Losses
Profit/Loss = Current Balance - Initial Balance
```

## 📊 Dashboard Components

| Component | Description |
|-----------|-------------|
| **Timer** | 60-second countdown to next cycle |
| **Period** | Current auto-generated period number |
| **Prediction** | AI-predicted result + confidence |
| **Result** | Actual API result |
| **Status** | WIN or LOSS indicator |
| **Balance** | Current account balance |
| **Level** | Current Martingale level |
| **History** | Last 20 trades with details |

## 🔌 API Integration Examples

### Simple REST API

```javascript
// Your backend
app.get('/api/prediction', (req, res) => {
    const result = Math.random() > 0.5 ? 'BIG' : 'SMALL';
    res.json({ result });
});

// Frontend config
CONFIG.API_URL = 'http://localhost:3000/api/prediction';
```

### Firebase Realtime Database

See `API_CONFIG.md` for detailed Firebase setup.

### WebSocket Real-Time

See `API_CONFIG.md` for WebSocket implementation.

## 🛠️ Advanced Features

### Auto-Start on Page Load

Uncomment in `app.js`:

```javascript
window.addEventListener('DOMContentLoaded', () => {
    init();
    setTimeout(() => startDashboard(), 1000);
});
```

### Custom Themes

Edit CSS variables in `style.css`:

```css
:root {
    --primary-color: #00d4ff;
    --secondary-color: #ff00ff;
    --success-color: #00ff88;
    --danger-color: #ff0055;
}
```

### Monitoring & Logging

```javascript
// Check in browser console
console.log(state);  // View current state
console.log(apiMetrics);  // View API performance
```

## 📱 Responsive Breakpoints

| Device | Size | Layout |
|--------|------|--------|
| Mobile | < 480px | 1 column |
| Tablet | 480px - 1024px | 2 columns |
| Desktop | > 1024px | 3 columns |

## 🔒 Security Notes

⚠️ **Important:**

- Never hardcode API keys in frontend code
- Use backend proxy for sensitive operations
- Store API keys in environment variables
- Validate all API responses
- Use HTTPS for production

Example secure implementation:

```javascript
// Frontend - NO API KEY
async function fetchResult() {
    return fetch('/api/proxy/prediction')
        .then(r => r.json())
        .then(d => d.result);
}

// Backend - API KEY HERE
app.get('/api/proxy/prediction', (req, res) => {
    const apiKey = process.env.API_KEY;
    // ... proxy request to actual API
});
```

## 🐛 Troubleshooting

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
→ Add CORS headers to your API or use a proxy

### API Not Connecting
```
API Error: 404
```
→ Verify API URL in CONFIG
→ Check API endpoint exists
→ Ensure API returns valid JSON

### Incorrect Results
```
Cannot read property 'result' of undefined
```
→ Verify API response format matches:
```json
{ "result": "BIG" }
```

## 📈 Statistics Explained

| Stat | Description |
|------|-------------|
| **Total Trades** | Number of completed prediction cycles |
| **Wins** | Number of correct predictions |
| **Losses** | Number of incorrect predictions |
| **Win Rate** | Percentage of winning trades |
| **Balance** | Current account balance |
| **P/L** | Total profit/loss |

## 🚀 Deployment

### GitHub Pages
```bash
git push origin main
# Enable Pages in Settings → Pages
```

### Netlify
```bash
netlify deploy --prod --dir=.
```

### Vercel
```bash
vercel --prod
```

### Firebase Hosting
```bash
firebase deploy --only hosting
```

## 📚 Documentation

- **API_CONFIG.md** - Complete API integration guide with examples
- **This README** - Quick start and overview
- **Code comments** - Detailed inline documentation

## ⚠️ Disclaimer

⚠️ **Use at Your Own Risk**

- Prediction accuracy is NOT guaranteed
- Automated systems can cause significant losses
- Always test with simulated data first
- Monitor system performance regularly
- Implement proper risk management
- This tool is for educational purposes

## 📄 License

MIT License - feel free to modify and distribute

## 🤝 Contributing

Pull requests welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on mobile and desktop
5. Submit a pull request

## 💬 Support

- Check API_CONFIG.md for integration help
- Review browser console for errors
- Check Network tab in DevTools
- Test API with Postman first

## 🎯 Roadmap

Future enhancements:
- [ ] User authentication system
- [ ] Data persistence (localStorage/database)
- [ ] Profit/Loss graphs
- [ ] Mobile app (React Native)
- [ ] Telegram bot notifications
- [ ] Advanced analytics
- [ ] Custom prediction algorithms
- [ ] Multi-strategy support

---

**Made with ❤️ by Lola2580**

🚀 Real-Time Automated Prediction & Tracking Dashboard

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-06
