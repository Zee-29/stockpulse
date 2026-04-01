# 📈 StockPulse — Stock Market Dashboard

A full-stack stock market application built with React featuring real-time price simulation, portfolio management, and virtual trading.

## 🚀 Live Demo
[View Live →](https://Zee-29.github.io/stockpulse)

## ✨ Features
- 📊 Real-time stock price updates (WebSocket simulation)
- 💼 Portfolio tracking with P&L calculations
- ⚡ Virtual paper trading platform
- 🔔 Price alert system
- 📰 Market news with sentiment analysis
- 📈 Interactive candlestick charts
- 👁 Custom watchlists
- 📋 Reports & analytics with export
- ⚙️ Admin dashboard with user management
- 💰 INR (₹) pricing

## 🛠 Tech Stack
- **Frontend:** React.js, Context API, CSS Variables
- **Charts:** Custom SVG candlestick & sparkline charts
- **Auth:** JWT-ready login/register flow
- **Real-time:** Simulated WebSocket price feeds

## 🏃 Run Locally
```bash
git clone https://github.com/Zee-29/stockpulse.git
cd stockpulse
npm install
npm run dev
```

## 📁 Project Structure
```
src/
├── StockMarketApp.jsx   # Main application (all modules)
└── main.jsx             # Entry point
```

## 🔮 Backend Integration Ready
- Alpha Vantage / IEX Cloud for real stock data
- MongoDB + Mongoose for database
- Socket.io for live WebSocket updates
- JWT authentication
