import React, { useState, useEffect } from 'react';
import './pages.css';

import { getWeather } from '../../services/weather';

const ALERTS = [
  { type: 'warning', msg: 'भारी बारिश की संभावना — 2 दिनों में। फ़सल सुरक्षित करें।', time: '1h ago' },
  { type: 'success', msg: 'खरीफ की बुवाई का सही समय — अगले 10 दिन आदर्श हैं।', time: '3h ago' },
  { type: 'info',    msg: 'सरकारी सब्सिडी की अंतिम तिथि: 25 मई तक आवेदन करें।', time: '6h ago' },
];

const QUICK_ACTIONS = [
  { id: 'crop-doctor',      icon: '🔬', label: 'Crop Doctor',   labelHi: 'फ़सल जाँच', color: '#52B788' },
  { id: 'marketplace-sell', icon: '💰', label: 'Sell Crop',     labelHi: 'फ़सल बेचो', color: '#F59E0B' },
  { id: 'expert-connect',   icon: '👨‍💼', label: 'Expert Help',  labelHi: 'विशेषज्ञ',  color: '#3B82F6' },
  { id: 'fintech',          icon: '📋', label: 'Apply Loan',    labelHi: 'ऋण लें',    color: '#8B5CF6' },
  { id: 'labour-hire',      icon: '👷', label: 'Hire Labour',   labelHi: 'मज़दूर',    color: '#EC4899' },
  { id: 'equipment-rent',   icon: '🚜', label: 'Rent Machine',  labelHi: 'उपकरण',     color: '#14B8A6' },
];

const MARKET_PRICES = [
  { crop: 'Wheat',  emoji: '🌾', price: 2150, change: +35, unit: '/qtl', trend: 'up' },
  { crop: 'Rice',   emoji: '🍚', price: 3200, change: -80, unit: '/qtl', trend: 'down' },
  { crop: 'Maize',  emoji: '🌽', price: 1850, change: +20, unit: '/qtl', trend: 'up' },
  { crop: 'Tomato', emoji: '🍅', price: 45,   change: +12, unit: '/kg',  trend: 'up' },
  { crop: 'Onion',  emoji: '🧅', price: 28,   change: -5,  unit: '/kg',  trend: 'down' },
  { crop: 'Potato', emoji: '🥔', price: 22,   change: +3,  unit: '/kg',  trend: 'up' },
];

const CROP_HEALTH = [
  { name: 'Wheat Field A', hi: 'गेहूं खेत A',  status: 'Healthy',    pct: 92, color: '#16A34A' },
  { name: 'Rice Field B',  hi: 'चावल खेत B',   status: 'Needs Water', pct: 57, color: '#D97706' },
  { name: 'Vegetable Plot',hi: 'सब्जी भूखंड', status: 'Pest Alert',  pct: 41, color: '#DC2626' },
];

function StatCard({ icon, label, labelHi, value, sub, color, delay }) {
  return (
    <div className={`card card-3d stat-card anim-fadeup delay-${delay}`}>
      <div className="stat-icon-wrap" style={{ background: `${color}1A`, color }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div className="stat-body">
        <span className="stat-label">{label} <span className="hindi" style={{ fontSize: 9 }}>{labelHi}</span></span>
        <div className="stat-value">{value}</div>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );
}

export default function HomeDashboard({ navigate }) {
  const [animPcts, setAnimPcts] = useState([0, 0, 0]);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    // Animate crop health bars
    const t = setTimeout(() => setAnimPcts(CROP_HEALTH.map(c => c.pct)), 400);
    
    // Auto-detect location via geolocation, fallback to Bhopal
    getWeather().then(data => {
      if (data) setWeatherData(data);
    });

    return () => clearTimeout(t);
  }, []);

  // Display a fallback if weather is still loading
  const w = weatherData || {
    temp: '--', feelsLike: '--', humidity: '--', windSpeed: '--', rain: '--', uv: '--',
    condition: 'Fetching location...', icon: '⛅', city: '…', region: '', country: '',
    alerts: [], forecast: []
  };

  return (
    <div className="dashboard-wrap anim-page">
      {/* Greeting */}
      <div className="dashboard-greeting anim-fadeup">
        <div>
          <h1 className="page-title">नमस्ते, Ramesh! 👋</h1>
          <p className="page-sub hindi">Aaj ka farm update — Sehore, Madhya Pradesh</p>
        </div>
        <div className="greeting-date">
          <span className="greeting-day">{new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</span>
          <span className="greeting-date-str">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard icon="🌡️" label="Temperature"  labelHi="तापमान"  value={`${w.temp}°C`}  sub={`Feels like ${w.feelsLike}°C`} color="#EF4444" delay={1} />
        <StatCard icon="💧" label="Humidity"     labelHi="नमी"     value={`${w.humidity}%`}   sub="Good for crops"  color="#3B82F6" delay={2} />
        <StatCard icon="💨" label="Wind Speed"   labelHi="हवा"     value={`${w.windSpeed} km/h`} sub="Current speed"    color="#6B7280" delay={3} />
        <StatCard icon="🌞" label="UV Index"     labelHi="UV सूचकांक" value={w.uv}         sub={w.uv >= 8 ? 'Very High ⚠️' : w.uv >= 5 ? 'Moderate' : 'Low — Safe'} color="#F59E0B" delay={4} />
      </div>

      {/* Quick Actions */}
      <div className="card anim-fadeup delay-3" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <div className="section-title"><span>⚡</span> Quick Actions <span className="hindi" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-muted)' }}>त्वरित कार्य</span></div>
        </div>
        <div className="quick-actions-grid">
          {QUICK_ACTIONS.map((a, i) => (
            <button
              key={a.id}
              className={`quick-action-btn anim-scalein delay-${i + 1}`}
              style={{ '--qa-color': a.color }}
              onClick={() => navigate && navigate(a.id)}
            >
              <span className="qa-icon">{a.icon}</span>
              <span className="qa-label">{a.label}</span>
              <span className="qa-hi hindi">{a.labelHi}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Weather */}
        <div className="card weather-widget anim-fadeup delay-4">
          <div className="section-header">
            <div className="section-title">⛅ Weather Forecast</div>
            <span className="badge badge-blue">📍 {w.city}{w.region ? `, ${w.region}` : ''}</span>
          </div>
          <div className="weather-now">
            <span className="weather-main-icon">{w.icon}</span>
            <div>
              <div className="weather-temp">{w.temp}°C</div>
              <div className="weather-cond">{w.condition}</div>
              <div className="weather-meta">
                💧 {w.humidity}% &nbsp;·&nbsp; 💨 {w.windSpeed} km/h &nbsp;·&nbsp; 🌧️ {w.rain} rain chance
              </div>
            </div>
          </div>
          <div className="forecast-strip">
            {w.forecast.map(f => (
              <div key={f.day} className="forecast-day-card">
                <span className="fc-day">{f.day}</span>
                <span className="fc-icon">{f.icon}</span>
                <span className="fc-hi">{f.high}°</span>
                <span className="fc-lo">{f.low}°</span>
              </div>
            ))}
          </div>
          {/* WeatherAPI.com attribution — required for free plan */}
          <div style={{ marginTop: 10, textAlign: 'right' }}>
            <a
              href="https://www.weatherapi.com/"
              title="Free Weather API"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 10, color: 'var(--text-light)', textDecoration: 'none', opacity: 0.7 }}
            >
              Powered by WeatherAPI.com
            </a>
          </div>
        </div>

        {/* Mandi Prices */}
        <div className="card anim-fadeup delay-5">
          <div className="section-header">
            <div className="section-title">📈 Mandi Prices</div>
            <span className="badge badge-live"><span className="live-dot" /> Live</span>
          </div>
          <div className="market-list">
            {MARKET_PRICES.map(m => (
              <div key={m.crop} className="market-row">
                <span className="market-emoji">{m.emoji}</span>
                <span className="market-name">{m.crop}</span>
                <span className="market-price">₹{m.price}{m.unit}</span>
                <span className={`badge ${m.trend === 'up' ? 'badge-green' : 'badge-red'}`}>
                  {m.trend === 'up' ? '↑' : '↓'} {Math.abs(m.change)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Crop Health */}
        <div className="card anim-fadeup delay-5">
          <div className="section-header">
            <div className="section-title">🌿 Crop Health Monitor</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {CROP_HEALTH.map((c, i) => (
              <div key={c.name}>
                <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{c.name}</span>
                    <span className="hindi" style={{ fontSize: 10, color: 'var(--text-light)', marginLeft: 6 }}>{c.hi}</span>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: c.color }}>{c.status}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${animPcts[i]}%`, background: c.color, transition: 'width 1.2s var(--ease-spring)' }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-light)', marginTop: 3 }}>{c.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="card anim-fadeup delay-6">
          <div className="section-header">
            <div className="section-title">🔔 Farm Alerts</div>
            <span className="badge badge-red">3</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ALERTS.map((a, i) => (
              <div key={i} className={`alert-item alert-${a.type}`}>
                <span>{a.type === 'warning' ? '⚠️' : a.type === 'success' ? '✅' : 'ℹ️'}</span>
                <div style={{ flex: 1 }}>
                  <p className="hindi">{a.msg}</p>
                  <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
