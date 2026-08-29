import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './pages.css';

import { useWeather } from '@/shared/hooks/useWeather';
import { useTranslation } from '@/i18n/useTranslation';
import { getMandiPrices, DEFAULT_MANDI_PRICES } from '@/services/api/agmarknet.service';
import { trackFeatureClick } from '@/shared/utils/analytics';
import { formatINR } from '@/shared/utils/formatters';

const ADVISORIES = {
  hi: [
    { title: 'सिंचाई सलाह', text: 'कल शाम बारिश की 65% संभावना है। अभी अतिरिक्त सिंचाई से बचें।', icon: '🌧️', tag: 'जल प्रबंधन' },
    { title: 'कीट रोकथाम', text: 'आर्द्रता 70%+ होने से धान में झुलसा रोग का खतरा। जैविक नीम अर्क का छिड़काव करें।', icon: '🛡️', tag: 'फसल सुरक्षा' },
    { title: 'मंडी अवसर', text: 'सीहोर मंडी में सोयाबीन के भाव में ₹45/क्विंटल की तेजी देखी गई है।', icon: '📈', tag: 'बाज़ार रुझान' },
  ],
  en: [
    { title: 'Irrigation Advisory', text: '65% chance of rain tomorrow evening. Hold off non-critical irrigation.', icon: '🌧️', tag: 'Water Mgmt' },
    { title: 'Pest Advisory', text: 'Humidity >70% increases blast risk in paddy. Apply organic neem spray.', icon: '🛡️', tag: 'Crop Safety' },
    { title: 'Market Opportunity', text: 'Soybean prices up +₹45/qtl in Sehore Mandi today.', icon: '📈', tag: 'Market Trend' },
  ]
};

const QUICK_ACTIONS = [
  { id: 'crop-doctor',      path: '/crop-doctor',      icon: '🔬', label: 'Crop Doctor AI', labelHi: 'फ़सल डॉक्टर AI', desc: 'Instant Scan', descHi: 'तुरंत जाँच', color: '#10B981', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))' },
  { id: 'marketplace-sell', path: '/marketplace-sell', icon: '🌾', label: 'Sell Harvest',   labelHi: 'फसल बेचें',     desc: 'Mandi Rates',  descHi: 'मंडी भाव',    color: '#F59E0B', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.05))' },
  { id: 'expert-connect',   path: '/expert-connect',   icon: '👨‍💼', label: 'Expert Help',   labelHi: 'विशेषज्ञ सलाह', desc: 'Free Demo',    descHi: 'मुफ्त सलाह',  color: '#3B82F6', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.05))' },
  { id: 'fintech',          path: '/fintech',          icon: '💳', label: 'Loans & Schemes',labelHi: 'ऋण व योजनाएं', desc: 'PM-KISAN/KCC', descHi: 'केसीसी/बीमा', color: '#8B5CF6', gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(124,58,237,0.05))' },
  { id: 'labour-hire',      path: '/labour-hire',      icon: '👷', label: 'Hire Labour',    labelHi: 'श्रमिक खोजें',  desc: 'Daily Wages',  descHi: 'दैनिक मज़दूर',color: '#EC4899', gradient: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(219,39,119,0.05))' },
  { id: 'equipment-rent',   path: '/equipment-rent',   icon: '🚜', label: 'Rent Machines',  labelHi: 'उपकरण किराया',  desc: 'Tractors/Harv',descHi: 'ट्रैक्टर/यंत्र',color: '#14B8A6', gradient: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(13,148,136,0.05))' },
];

const CROP_HEALTH = [
  { name: 'Wheat Field A (North)', hi: 'गेहूं खेत A (उत्तरी)', status: 'Healthy',    statusHi: 'उत्तम स्वास्थ्य', pct: 94, color: '#10B981', area: '4.5 Acres', stage: 'Tillering' },
  { name: 'Rice Field B (South)', hi: 'धान खेत B (दक्षिणी)',   status: 'Needs Water',statusHi: 'सिंचाई आवश्यक',   pct: 62, color: '#F59E0B', area: '3.0 Acres', stage: 'Vegetative' },
  { name: 'Vegetable Plot 1',     hi: 'सब्जी प्लॉट 1',         status: 'Pest Alert', statusHi: 'कीट निगरानी',     pct: 42, color: '#EF4444', area: '1.2 Acres', stage: 'Flowering' },
];

export default function HomeDashboard() {
  const routerNavigate = useNavigate();
  const { t, isHindi } = useTranslation();
  const [animPcts, setAnimPcts] = useState([0, 0, 0]);
  const [mandiPrices, setMandiPrices] = useState(DEFAULT_MANDI_PRICES.slice(0, 6));
  const { weather: weatherData, isStale } = useWeather();
  const [advisoryIdx, setAdvisoryIdx] = useState(0);

  useEffect(() => {
    const tTimer = setTimeout(() => setAnimPcts(CROP_HEALTH.map(c => c.pct)), 350);
    
    getMandiPrices()
      .then(prices => {
        if (prices?.length) setMandiPrices(prices.slice(0, 6));
      })
      .catch(() => {});

    const advTimer = setInterval(() => {
      setAdvisoryIdx(prev => (prev + 1) % 3);
    }, 6000);

    return () => {
      clearTimeout(tTimer);
      clearInterval(advTimer);
    };
  }, []);

  const handleActionClick = (action) => {
    trackFeatureClick(action.id);
    routerNavigate(action.path);
  };

  const w = weatherData || {
    temp: '--', feelsLike: '--', humidity: '--', windSpeed: '--', rain: '--', uv: '--',
    condition: 'Fetching location...', icon: '⛅', city: 'Bhopal', region: 'MP',
    forecast: []
  };

  const currentAdvisory = (isHindi ? ADVISORIES.hi : ADVISORIES.en)[advisoryIdx];

  const forecastList = React.useMemo(() => {
    const list = [...(w.forecast || [])];
    const daysNeeded = 6 - list.length;
    if (daysNeeded > 0) {
      const today = new Date();
      const startIdx = list.length + 1;
      const icons = ['☀️', '⛅', '🌧️', '🌤️', '⛅', '🌩️'];
      const baseHi = list[0]?.high || (typeof w.temp === 'number' ? w.temp : 32);
      const baseLo = list[0]?.low || (baseHi - 7);
      for (let i = 0; i < daysNeeded; i++) {
        const d = new Date();
        d.setDate(today.getDate() + startIdx + i);
        const jitter = (i % 2 === 0 ? 1 : -1) * (i + 1);
        list.push({
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          icon: icons[(startIdx + i) % icons.length],
          high: baseHi + jitter,
          low: baseLo + (jitter > 0 ? 1 : -1),
        });
      }
    }
    return list.slice(0, 6);
  }, [w.forecast, w.temp]);

  return (
    <div className="dashboard-container anim-page">
      {/* ── Modern Hero Banner ── */}
      <section className="dash-hero-card anim-fadeup">
        <div className="dash-hero-content">
          <div className="dash-hero-badge">
            <span className="live-dot" />
            <span>{isHindi ? 'खरीफ सीजन 2026 · लाइव अपडेट' : 'Kharif Season 2026 · Live System'}</span>
          </div>
          <h1 className="dash-hero-title">
            {isHindi ? 'नमस्ते, Ramesh Kumar! 👋' : 'Welcome back, Ramesh! 👋'}
          </h1>
          <p className="dash-hero-sub">
            {isHindi 
              ? 'सीहोर, मध्य प्रदेश — आपकी 3 फ़सलें स्वस्थ स्थिति में हैं और मौसम अनुकूल है।' 
              : 'Sehore, Madhya Pradesh — 3 crops monitored, weather optimal for fieldwork.'}
          </p>

          {/* Dynamic Advisory Pill */}
          <div className="dash-advisory-pill" onClick={() => setAdvisoryIdx(i => (i + 1) % 3)}>
            <span className="dash-advisory-icon">{currentAdvisory.icon}</span>
            <div className="dash-advisory-text">
              <strong>{currentAdvisory.title}:</strong> {currentAdvisory.text}
            </div>
            <span className="dash-advisory-tag">{currentAdvisory.tag}</span>
          </div>
        </div>

        <div className="dash-hero-weather-snapshot">
          <div className="dash-hero-temp-wrap">
            <span className="dash-hero-weather-icon">{w.icon || '⛅'}</span>
            <div>
              <div className="dash-hero-temp">{w.temp}°C</div>
              <div className="dash-hero-cond">{w.condition}</div>
            </div>
          </div>
          <div className="dash-hero-weather-loc">
            📍 {w.city}, {w.region || 'MP'}
            {isStale && <span className="dash-offline-tag" title="Offline Cached">📴</span>}
          </div>
        </div>
      </section>

      {/* ── Micro-Climate Stat Metrics ── */}
      <section className="dash-stats-grid">
        <div className="dash-stat-card anim-fadeup delay-1">
          <div className="dash-stat-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}>
            <span>🌡️</span>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-label">{isHindi ? 'तापमान' : 'Temperature'}</span>
            <div className="dash-stat-value">{w.temp}°C</div>
            <span className="dash-stat-sub">{isHindi ? `महसूस ${w.feelsLike}°C` : `Feels ${w.feelsLike}°C`}</span>
          </div>
        </div>

        <div className="dash-stat-card anim-fadeup delay-2">
          <div className="dash-stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}>
            <span>💧</span>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-label">{isHindi ? 'नमी' : 'Humidity'}</span>
            <div className="dash-stat-value">{w.humidity}%</div>
            <span className="dash-stat-sub" style={{ color: '#10B981' }}>
              {isHindi ? '✓ आदर्श स्तर' : '✓ Optimal'}
            </span>
          </div>
        </div>

        <div className="dash-stat-card anim-fadeup delay-3">
          <div className="dash-stat-icon-wrap" style={{ background: 'rgba(107, 114, 128, 0.12)', color: '#4B5563' }}>
            <span>💨</span>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-label">{isHindi ? 'हवा की गति' : 'Wind Speed'}</span>
            <div className="dash-stat-value">{w.windSpeed} <small>km/h</small></div>
            <span className="dash-stat-sub">{isHindi ? 'छिड़काव हेतु उपयुक्त' : 'Safe for spraying'}</span>
          </div>
        </div>

        <div className="dash-stat-card anim-fadeup delay-4">
          <div className="dash-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' }}>
            <span>🌞</span>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-label">{isHindi ? 'UV सूचकांक' : 'UV Index'}</span>
            <div className="dash-stat-value">{w.uv}</div>
            <span className="dash-stat-sub">
              {w.uv >= 8 ? (isHindi ? '⚠️ तेज धूप' : '⚠️ High') : (isHindi ? 'सामान्य' : 'Normal')}
            </span>
          </div>
        </div>
      </section>

      {/* ── Quick Action Command Center ── */}
      <section className="dash-section anim-fadeup delay-2">
        <div className="dash-section-header">
          <h2 className="dash-section-title">
            <span className="dash-section-emoji">⚡</span>
            {isHindi ? 'त्वरित सेवाएं' : 'Quick Services'}
          </h2>
          <span className="dash-section-sub">
            {isHindi ? 'एक क्लिक में सीधी सेवाएं' : 'Direct access tools'}
          </span>
        </div>

        <div className="dash-actions-grid">
          {QUICK_ACTIONS.map((a, i) => (
            <button
              key={a.id}
              className={`dash-action-card anim-scalein delay-${i + 1}`}
              onClick={() => handleActionClick(a)}
              style={{ '--action-color': a.color, background: a.gradient }}
              aria-label={isHindi ? a.labelHi : a.label}
            >
              <div className="dash-action-top">
                <span className="dash-action-icon">{a.icon}</span>
                <span className="dash-action-arrow">→</span>
              </div>
              <div className="dash-action-body">
                <span className="dash-action-title">{isHindi ? a.labelHi : a.label}</span>
                <span className="dash-action-desc">{isHindi ? a.descHi : a.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── 2-Column Main Dashboard Grid ── */}
      <div className="dash-main-grid">
        {/* Left Column: Live Mandi + 6-Day Forecast */}
        <div className="dash-grid-col">
          {/* Live Mandi Prices */}
          <div className="dash-card anim-fadeup delay-3">
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">
                  📈 {isHindi ? 'लाइव मंडी भाव (मध्य प्रदेश)' : 'Live Mandi Prices (MP)'}
                </h3>
                <span className="dash-card-sub">
                  {isHindi ? 'Agmarknet ताज़ा भाव · प्रति क्विंटल' : 'Real-time Agmarknet rates · /qtl'}
                </span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => routerNavigate('/marketplace-sell')}>
                {isHindi ? 'सभी देखें →' : 'View All →'}
              </button>
            </div>

            <div className="dash-mandi-list">
              {mandiPrices.map(m => (
                <div key={m.id || m.crop} className="dash-mandi-row">
                  <div className="dash-mandi-crop-info">
                    <span className="dash-mandi-emoji">{m.emoji}</span>
                    <div>
                      <div className="dash-mandi-crop-name">{isHindi && m.cropHi ? m.cropHi : m.crop}</div>
                      <div className="dash-mandi-loc">📍 {m.loc} Mandi</div>
                    </div>
                  </div>

                  <div className="dash-mandi-price-wrap">
                    <div className="dash-mandi-price">₹{m.current}</div>
                    <span className={`dash-mandi-trend ${m.trend === 'up' ? 'trend-up' : 'trend-down'}`}>
                      {m.trend === 'up' ? '↑' : '↓'} ₹{Math.abs(m.change)}
                    </span>
                  </div>

                  <button 
                    className="btn btn-primary btn-sm dash-mandi-sell-btn"
                    onClick={() => routerNavigate('/marketplace-sell')}
                  >
                    {isHindi ? 'बेचें' : 'Sell'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 6-Day Micro-Forecast */}
          <div className="dash-card anim-fadeup delay-4">
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">
                  ⛅ {isHindi ? '6-दिवसीय मौसम पूर्वानुमान' : '6-Day Weather Forecast'}
                </h3>
                <span className="dash-card-sub">
                  {isHindi ? 'खेत कार्य योजना के लिए' : 'For field scheduling'}
                </span>
              </div>
            </div>

            <div className="dash-forecast-strip">
              {forecastList.map((f, idx) => (
                <div key={f.day || idx} className="dash-forecast-day">
                  <span className="dash-fc-day">{f.day}</span>
                  <span className="dash-fc-icon">{f.icon || '⛅'}</span>
                  <div className="dash-fc-temps">
                    <span className="dash-fc-hi">{f.high}°</span>
                    <span className="dash-fc-lo">{f.low}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Crop Health Monitor & Farm Alerts */}
        <div className="dash-grid-col">
          {/* Crop Health Monitor */}
          <div className="dash-card anim-fadeup delay-3">
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">
                  🌿 {isHindi ? 'खेत फ़सल स्वास्थ्य निगरानी' : 'Field Crop Health Monitor'}
                </h3>
                <span className="dash-card-sub">
                  {isHindi ? 'AI उपग्रह व स्कैन स्वास्थ्य सूचकांक' : 'AI satellite & scan health index'}
                </span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => routerNavigate('/crop-doctor')}>
                + {isHindi ? 'AI स्कैन' : 'New Scan'}
              </button>
            </div>

            <div className="dash-health-list">
              {CROP_HEALTH.map((c, i) => (
                <div key={c.name} className="dash-health-item">
                  <div className="dash-health-top">
                    <div>
                      <div className="dash-health-name">{isHindi ? c.hi : c.name}</div>
                      <span className="dash-health-meta">{c.area} · {c.stage}</span>
                    </div>
                    <span className="dash-health-status-badge" style={{ color: c.color, background: `${c.color}15`, borderColor: `${c.color}30` }}>
                      {isHindi ? c.statusHi : c.status}
                    </span>
                  </div>

                  <div className="dash-health-bar-wrap">
                    <div className="dash-health-bar-track">
                      <div 
                        className="dash-health-bar-fill" 
                        style={{ width: `${animPcts[i]}%`, background: c.color }} 
                      />
                    </div>
                    <span className="dash-health-pct" style={{ color: c.color }}>{c.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Farm Alerts & Actionable Notifications */}
          <div className="dash-card anim-fadeup delay-4">
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">
                  🔔 {isHindi ? 'खेत अलर्ट व सूचनाएं' : 'Farm Alerts & Actions'}
                </h3>
                <span className="dash-card-sub">
                  {isHindi ? 'तत्काल ध्यान देने योग्य' : 'Action items'}
                </span>
              </div>
              <span className="badge badge-red">3 Active</span>
            </div>

            <div className="dash-alerts-list">
              <div className="dash-alert-card alert-warn">
                <span className="dash-alert-icon">⚠️</span>
                <div className="dash-alert-content">
                  <div className="dash-alert-title">
                    {isHindi ? 'मौसम चेतावनी — भारी वर्षा' : 'Weather Alert — Rain Forecast'}
                  </div>
                  <p className="dash-alert-desc">
                    {isHindi 
                      ? 'अगले 48 घंटों में तेज हवा व वर्षा। कटी हुई फसल को सुरक्षित गोदाम में रखें।' 
                      : 'Heavy rain & wind in next 48h. Protect open harvested crops.'}
                  </p>
                  <span className="dash-alert-time">1h ago · IMD Bhopal</span>
                </div>
              </div>

              <div className="dash-alert-card alert-success">
                <span className="dash-alert-icon">🌱</span>
                <div className="dash-alert-content">
                  <div className="dash-alert-title">
                    {isHindi ? 'बुवाई का आदर्श समय' : 'Ideal Sowing Window'}
                  </div>
                  <p className="dash-alert-desc">
                    {isHindi 
                      ? 'मिट्टी की नमी 68%। सोयाबीन व मक्का बुवाई के लिए अगले 7 दिन सर्वश्रेष्ठ।' 
                      : 'Soil moisture 68%. Ideal 7-day window for Soybean & Maize sowing.'}
                  </p>
                  <span className="dash-alert-time">3h ago · Agriculture Dept</span>
                </div>
              </div>

              <div className="dash-alert-card alert-info">
                <span className="dash-alert-icon">🏛️</span>
                <div className="dash-alert-content">
                  <div className="dash-alert-title">
                    {isHindi ? 'ड्रिप सिंचाई सब्सिडी अंतिम तिथि' : 'Drip Irrigation Subsidy'}
                  </div>
                  <p className="dash-alert-desc">
                    {isHindi 
                      ? 'मध्य प्रदेश ड्रिप सिंचाई योजना में 55% सब्सिडी के लिए आवेदन 25 मई तक खुला है।' 
                      : '55% subsidy applications for drip irrigation open till 25th May.'}
                  </p>
                  <div style={{ marginTop: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => routerNavigate('/fintech')}>
                      {isHindi ? 'आवेदन करें →' : 'Apply Now →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
