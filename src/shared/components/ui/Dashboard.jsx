import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Droplets, Wind, TrendingUp, TrendingDown, Leaf, AlertCircle, CheckCircle, Clock, MapPin, Thermometer, BarChart2 } from 'lucide-react';

const weatherData = {
  temp: 28,
  humidity: 65,
  windSpeed: 12,
  condition: 'Partly Cloudy',
  icon: '⛅',
  forecast: [
    { day: 'Mon', icon: '☀️', high: 31, low: 22 },
    { day: 'Tue', icon: '🌧️', high: 26, low: 19 },
    { day: 'Wed', icon: '⛅', high: 29, low: 21 },
    { day: 'Thu', icon: '☀️', high: 33, low: 23 },
    { day: 'Fri', icon: '🌩️', high: 25, low: 18 },
  ],
};

const marketPrices = [
  { crop: 'Wheat', price: 2150, change: +35, unit: '/quintal', emoji: '🌾' },
  { crop: 'Rice', price: 3200, change: -80, unit: '/quintal', emoji: '🍚' },
  { crop: 'Maize', price: 1850, change: +20, unit: '/quintal', emoji: '🌽' },
  { crop: 'Tomato', price: 45, change: +12, unit: '/kg', emoji: '🍅' },
  { crop: 'Onion', price: 28, change: -5, unit: '/kg', emoji: '🧅' },
  { crop: 'Potato', price: 22, change: +3, unit: '/kg', emoji: '🥔' },
];

const alerts = [
  { type: 'warning', icon: AlertCircle, msg: 'Heavy rain expected in 2 days. Protect crops from waterlogging.' },
  { type: 'success', icon: CheckCircle, msg: 'Optimal sowing time for Kharif crops — next 10 days.' },
  { type: 'info', icon: Clock, msg: 'Government subsidy deadline: apply before May 25.' },
];

const cropHealth = [
  { name: 'Wheat Field A', status: 'Healthy', pct: 92, color: '#4CAF50' },
  { name: 'Rice Field B', status: 'Needs Water', pct: 58, color: '#FF9800' },
  { name: 'Vegetable Plot', status: 'Pest Alert', pct: 41, color: '#F44336' },
];

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="stat-card fade-in card">
      <div className="stat-icon" style={{ background: `${color}18`, color }}>
        <Icon size={22} />
      </div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [animPct, setAnimPct] = useState([0, 0, 0]);

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimPct(cropHealth.map(c => c.pct));
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="dashboard-layout">

      {/* Stat Cards */}
      <div className="stats-row">
        <StatCard icon={Thermometer} label="Temperature" value={`${weatherData.temp}°C`} sub="Feels like 30°C" color="#FF5722" />
        <StatCard icon={Droplets} label="Humidity" value={`${weatherData.humidity}%`} sub="Good for crops" color="#2196F3" />
        <StatCard icon={Wind} label="Wind Speed" value={`${weatherData.windSpeed} km/h`} sub="NW direction" color="#607D8B" />
        <StatCard icon={Leaf} label="Crop Health" value="78%" sub="2 alerts active" color="#4CAF50" />
      </div>

      <div className="dashboard-grid">

        {/* Weather Card */}
        <div className="card weather-card fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="section-header">
            <Cloud size={20} />
            <h3>Weather Forecast</h3>
            <span className="badge badge-blue"><MapPin size={12} /> Bhopal, MP</span>
          </div>
          <div className="weather-main">
            <span className="weather-emoji">{weatherData.icon}</span>
            <div>
              <div className="weather-temp">{weatherData.temp}°C</div>
              <div className="weather-cond">{weatherData.condition}</div>
            </div>
          </div>
          <div className="forecast-row">
            {weatherData.forecast.map(f => (
              <div key={f.day} className="forecast-day">
                <span className="forecast-label">{f.day}</span>
                <span className="forecast-icon">{f.icon}</span>
                <span className="forecast-hi">{f.high}°</span>
                <span className="forecast-lo">{f.low}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Market Prices */}
        <div className="card market-card fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="section-header">
            <BarChart2 size={20} />
            <h3>Mandi Prices</h3>
            <span className="badge badge-green">Live</span>
          </div>
          <div className="market-list">
            {marketPrices.map(m => (
              <div key={m.crop} className="market-row">
                <span className="market-emoji">{m.emoji}</span>
                <span className="market-name">{m.crop}</span>
                <span className="market-price">₹{m.price}{m.unit}</span>
                <span className={`market-change ${m.change > 0 ? 'up' : 'down'}`}>
                  {m.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(m.change)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Crop Health */}
        <div className="card health-card fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="section-header">
            <Leaf size={20} />
            <h3>Crop Health Monitor</h3>
          </div>
          <div className="health-list">
            {cropHealth.map((c, i) => (
              <div key={c.name} className="health-item">
                <div className="health-top">
                  <span className="health-name">{c.name}</span>
                  <span className="health-status" style={{ color: c.color }}>{c.status}</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${animPct[i]}%`,
                      background: c.color,
                      transition: 'width 1.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
                    }}
                  />
                </div>
                <span className="health-pct">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="card alerts-card fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="section-header">
            <AlertCircle size={20} />
            <h3>Farm Alerts</h3>
          </div>
          <div className="alerts-list">
            {alerts.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className={`alert-item alert-${a.type}`}>
                  <Icon size={18} />
                  <span>{a.msg}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
