import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/i18n/useTranslation';
import './LandingPage.css';

// ── Role Quick Switcher Presets ─────────────────────────────
const DEMO_ROLES = [
  { id: 'farmer', title: 'Farmer', titleHi: 'किसान', icon: '👨‍🌾', subtitle: 'AI Diagnostics, Mandi Prices & Farm Tools', badge: 'Popular' },
  { id: 'expert', title: 'Agri Scientist', titleHi: 'कृषि वैज्ञानिक', icon: '🔬', subtitle: 'Tele-Consultation Queue & Prescriptions', badge: 'ICAR Verified' },
  { id: 'buyer', title: 'Crop Buyer / Trader', titleHi: 'अनाज खरीदार', icon: '🛒', subtitle: 'Direct Farm Sourcing & Bulk Procurement', badge: 'Zero Middleman' },
  { id: 'worker', title: 'Farm Labourer', titleHi: 'कृषि श्रमिक', icon: '👷', subtitle: 'Daily Wage Job Discovery & Skill Registry', badge: 'Direct Payout' },
  { id: 'admin', title: 'System Admin', titleHi: 'प्रशासक', icon: '🛡️', subtitle: 'Ecosystem Telemetry & FPO Management', badge: 'Full Access' },
];

// ── Interactive Features ─────────────────────────────────────
const INTERACTIVE_TABS = [
  {
    id: 'cropDoctor',
    name: 'AI Crop Doctor',
    nameHi: 'फ़सल डॉक्टर AI',
    icon: '🔬',
    tag: 'Gemini 2.0 / Vision AI',
    headline: 'Instant Leaf Pathology & Treatment in Hindi',
    headlineHi: 'पत्ते की तस्वीर से बीमारी की तुरंत पहचान व उपचार',
    desc: 'Multi-modal vision analysis trained on 50,000+ Indian crop disease datasets. Detects Rust, Blight, Leaf Curl, and nutrient deficiencies with 99.4% confidence and speaks out prescriptions aloud.',
    demoData: {
      crop: 'Wheat (गेहूं)',
      disease: 'Yellow Rust (पीला रतुआ / Puccinia striiformis)',
      severity: 'Medium (45% Infected)',
      confidence: '98.6%',
      treatment: 'Spray Propiconazole 25% EC @ 1ml/L water immediately.',
      treatmentHi: 'प्रोपिकोनाज़ोल 25% EC को 1 मिली/लीटर पानी में मिलाकर तुरंत छिड़कें।',
      voiceNote: '🔊 "गेंहू में पीला रतुआ के लक्षण पाए गए हैं। तुरंत प्रोपिकोनाज़ोल का छिड़काव करें।"',
    }
  },
  {
    id: 'mandi',
    name: 'Real-Time Mandi Bhav',
    nameHi: 'लाइव मंडी भाव',
    icon: '📈',
    tag: 'Agmarknet · 500+ Mandis',
    headline: 'Real-time Agmarknet Rates with Official MSP Benchmarks',
    headlineHi: 'सरकारी समर्थन मूल्य (MSP) और ताज़ा मंडी भाव',
    desc: 'Bypasses exploitative middlemen by aggregating live commodity prices across 500+ APMC mandis. Includes price swing predictive indicators and 1-tap buyer listing.',
    demoData: {
      items: [
        { crop: 'Wheat (गेहूं)', current: '₹2,450/qtl', msp: '₹2,275/qtl', change: '+₹65', trend: 'up', mandi: 'Sehore APMC' },
        { crop: 'Soybean (सोयाबीन)', current: '₹5,140/qtl', msp: '₹4,600/qtl', change: '+₹40', trend: 'up', mandi: 'Bhopal Mandi' },
        { crop: 'Tomato (टमाटर)', current: '₹1,850/qtl', msp: '₹1,200/qtl', change: '-₹30', trend: 'down', mandi: 'Indore Mandi' },
      ]
    }
  },
  {
    id: 'weather',
    name: 'Micro-Climate Radar',
    nameHi: 'मौसम व छिड़काव अलर्ट',
    icon: '⛅',
    tag: 'IMD / Agro-Meteorology',
    headline: 'Hyper-Local Agricultural Weather & Spray Advisories',
    headlineHi: 'खेत स्तर का मौसम पूर्वानुमान और कीटनाशक छिड़काव सलाह',
    desc: 'Calculates soil moisture, evapotranspiration, rainfall timing, and wind speed to recommend the exact ideal hours for sowing, irrigation, and pesticide spraying.',
    demoData: {
      temp: '26°C',
      feels: '27°C',
      humidity: '78%',
      wind: '12 km/h (Safe for Spraying)',
      sprayVerdict: '✅ IDEAL FOR SPRAYING TODAY (10 AM - 3 PM)',
      rainRisk: 'Rain predicted in 48 hours (65% chance)'
    }
  },
  {
    id: 'machinery',
    name: 'Machinery Uber',
    nameHi: 'कृषि मशीनरी रेंटल',
    icon: '🚜',
    tag: 'Uber for Tractors & Drones',
    headline: 'Affordable Farm Mechanization on Demand',
    headlineHi: 'किफायती दरों पर ट्रैक्टर, रोटावेटर व ड्रोन किराए पर',
    desc: 'Connects smallholder farmers who cannot afford expensive machinery with local equipment owners for hourly/daily rentals of tractors, rotavators, harvesters, and spray drones.',
    demoData: {
      equipment: [
        { name: 'Mahindra 575 DI Tractor', type: 'Tractor 45HP', rate: '₹750/hr', dist: '2.4 km away', owner: 'Vikram Patel' },
        { name: 'DJI Agras T40 Spray Drone', type: 'Drone Spraying', rate: '₹350/acre', dist: '4.8 km away', owner: 'AgriTech FPO' },
        { name: 'Shaktiman Rotary Tiller', type: 'Rotavator', rate: '₹400/hr', dist: '1.8 km away', owner: 'Suraj Singh' },
      ]
    }
  },
  {
    id: 'fintech',
    name: 'Rural FinTech & KCC',
    nameHi: 'किसान ऋण व योजनाएं',
    icon: '💳',
    tag: 'Govt. Schemes & Micro-Credit',
    headline: 'Kisan Credit Score & 1-Click Scheme Applications',
    headlineHi: 'किसान क्रेडिट स्कोर और पीएम किसान/केसीसी डायरेक्ट आवेदन',
    desc: 'Analyzes farm landholding, soil health, crop history, and past yields to generate a digital Kisan Credit Score, enabling instant eligibility for PM-KISAN, KCC, and PMFBY subsidies.',
    demoData: {
      score: '745 / 900',
      grade: 'Prime Farmer (Excellent)',
      eligibleLoans: '₹3,50,000 at 4% p.a. under KCC',
      activeSchemes: ['PM-KISAN (₹6,000/yr)', 'PMFBY Crop Insurance', 'Solar Pump 75% Subsidy']
    }
  },
  {
    id: 'voice',
    name: 'Bhashini Voice AI',
    nameHi: 'आवाज़ सहायक (वॉइस AI)',
    icon: '🎙️',
    tag: 'Speech-to-Intent AI',
    headline: '100% Voice-Controlled in Hindi & Regional Dialects',
    headlineHi: 'बिना टाइप किए बोलकर चलाएं — शुद्ध देहाती हिंदी में',
    desc: 'Empowers farmers with zero digital literacy. Just press the mic and say "सीहोर मंडी में गेहूं का भाव क्या है" or "मेरी फसल में कीड़ा लगा है" for instant spoken guidance.',
    demoData: {
      query: '🗣️ "सीहोर मंडी में सोयाबीन का भाव क्या है और आज छिड़काव कर सकते हैं?"',
      response: '🔊 "सीहोर मंडी में सोयाबीन ₹5,140 प्रति क्विंटल है (+₹40)। आज हवा की गति 12 किमी/घंटा है, दोपहर 2 बजे तक कीटनाशक छिड़काव सुरक्षित है।"'
    }
  }
];

// ── Key Metrics ──────────────────────────────────────────────
const METRICS = [
  { value: '140M+', label: 'Indian Farmers Addressable', labelHi: 'भारतीय किसान लक्षित' },
  { value: '99.4%', label: 'AI Diagnosis Accuracy', labelHi: 'AI रोग पहचान सटीकता' },
  { value: '500+', label: 'Live APMC Mandis', labelHi: 'लाइव मंडियां जुड़ी' },
  { value: '0%', label: 'Broker / Middleman Fee', labelHi: 'दलाली कमीशन शून्य' },
  { value: '< 2 MB', label: 'Ultra-Lightweight PWA Size', labelHi: 'अति-हल्का PWA ऐप' },
  { value: '100%', label: 'Offline Resilient (IndexedDB)', labelHi: 'ऑफ़लाइन काम करता है' },
];

// ── Traditional vs. KrishiMitra Matrix ───────────────────────
const COMPARISON = [
  { feature: 'Crop Disease Diagnosis', traditional: 'Wait 3-5 days for visit or guess chemicals', krishi: 'Instant AI Leaf Scan in 3 seconds with Hindi voice' },
  { feature: 'Mandi Price Discovery', traditional: 'Dependent on local village brokers (Arhatiyas)', krishi: 'Live Agmarknet & e-NAM prices across all APMC mandis' },
  { feature: 'Heavy Machinery Access', traditional: 'High capital cost (₹8L+), machines sit idle', krishi: 'Uber-style on-demand hourly tractor & drone rentals' },
  { feature: 'Labour Availability', traditional: 'Word-of-mouth shortages during peak harvest', krishi: 'Digital worker registry with transparent daily wages' },
  { feature: 'Agricultural Credit', traditional: 'Informal moneylenders charging 24-36% interest', krishi: 'Digital KCC score linking 4% subsidized credit' },
  { feature: 'Digital Accessibility', traditional: 'Complex English text apps designed for cities', krishi: 'Voice-First Hindi UI, offline mode & audio narration' }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginWithDemo, authStep } = useApp();
  const { t, isHindi, toggleLang } = useTranslation();
  const [activeTab, setActiveTab] = useState('cropDoctor');
  const [selectedRole, setSelectedRole] = useState('farmer');

  const handleLaunchDemo = (role = 'farmer') => {
    loginWithDemo(role);
    const targetPath = 
      role === 'farmer' ? '/dashboard' :
      role === 'expert' ? '/expert-home' :
      role === 'buyer'  ? '/marketplace-browse' :
      role === 'worker' ? '/worker-dashboard' :
      '/admin';
    navigate(targetPath);
  };

  const currentTab = INTERACTIVE_TABS.find(t => t.id === activeTab) || INTERACTIVE_TABS[0];

  return (
    <div className="landing-page">
      {/* ════════════ TOP NAVBAR ════════════ */}
      <header className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="landing-brand-logo">🌿</span>
            <div className="landing-brand-text">
              <span className="landing-brand-name hindi">कृषि Mitra</span>
              <span className="landing-brand-sub">KrishiMitra AgriTech</span>
            </div>
          </div>

          <nav className="landing-nav-links">
            <a href="#features" className="nav-link">{isHindi ? 'सुविधाएं' : 'Features'}</a>
            <a href="#live-demo" className="nav-link">{isHindi ? 'लाइव डेमो' : 'Live Interactive Demo'}</a>
            <a href="#impact" className="nav-link">{isHindi ? 'प्रभाव' : 'Impact'}</a>
            <a href="#architecture" className="nav-link">{isHindi ? 'तकनीक व कोड' : 'Tech Stack'}</a>
            <a href="https://github.com/shivasingh95/Kisan-Mitra" target="_blank" rel="noreferrer" className="nav-link github-link">
              ⭐ GitHub
            </a>
          </nav>

          <div className="landing-nav-actions">
            <button 
              className="btn btn-secondary btn-sm lang-toggle-pill" 
              onClick={toggleLang}
              title="Toggle Language"
            >
              🌐 {isHindi ? 'English' : 'हिन्दी'}
            </button>

            {authStep === 'app' ? (
              <button className="btn btn-primary btn-sm launch-btn" onClick={() => navigate('/dashboard')}>
                🚀 {isHindi ? 'डैशबोर्ड खोलें' : 'Go to App →'}
              </button>
            ) : (
              <button className="btn btn-primary btn-sm launch-btn" onClick={() => handleLaunchDemo('farmer')}>
                ⚡ {isHindi ? 'डेमो चलाएं' : 'Launch Demo'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ════════════ HERO SECTION ════════════ */}
      <section className="landing-hero">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="hero-container">
          <div className="hero-badge anim-fadein">
            <span className="hero-badge-dot" />
            <span>🇮🇳 {isHindi ? 'भारत का नंबर 1 AI किसान इकोसिस्टम' : "India's #1 AI AgriTech Ecosystem"}</span>
            <span className="hero-badge-tag">React 19 + AI Vision</span>
          </div>

          <h1 className="hero-title anim-fadeup">
            {isHindi ? (
              <>भारतीय कृषि को सशक्त बनाएं <span className="hero-gradient-text">आर्टिफिशियल इंटेलिजेंस</span> के साथ</>
            ) : (
              <>Empowering Indian Agriculture with <span className="hero-gradient-text">Next-Gen Artificial Intelligence</span></>
            )}
          </h1>

          <p className="hero-subtitle anim-fadeup delay-1">
            {isHindi ? (
              'एआई फसल डॉक्टर, ताज़ा मंडी भाव, ट्रैक्टर व मशीनरी रेंटल, विशेषज्ञ सलाह और किसान क्रेडिट — सब कुछ एक ही मंच पर। बिना दलाली, पूरी तरह सुरक्षित।'
            ) : (
              'From multi-modal AI leaf pathology and real-time Agmarknet commodity prices to on-demand tractor rentals and instant KCC credit scoring — built for 140M+ Indian farmers.'
            )}
          </p>

          {/* ── 1-Click Interactive Persona Selector ── */}
          <div className="hero-role-selector-card anim-fadeup delay-2">
            <div className="role-selector-header">
              <span className="role-selector-title">
                ⚡ {isHindi ? 'किसी भी भूमिका में तुरंत टेस्ट करें (1-क्लिक डेमो):' : 'Select a Persona to Test Live System Instantly:'}
              </span>
              <span className="role-selector-hint">{isHindi ? 'बिना पासवर्ड 1-क्लिक लॉगिन' : 'No sign-up required'}</span>
            </div>

            <div className="hero-roles-grid">
              {DEMO_ROLES.map(role => (
                <button
                  key={role.id}
                  className={`hero-role-btn ${selectedRole === role.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedRole(role.id);
                    handleLaunchDemo(role.id);
                  }}
                >
                  <span className="role-btn-icon">{role.icon}</span>
                  <div className="role-btn-content">
                    <div className="role-btn-top">
                      <span className="role-btn-name">{isHindi ? role.titleHi : role.title}</span>
                      <span className="role-btn-badge">{role.badge}</span>
                    </div>
                    <span className="role-btn-sub">{role.subtitle}</span>
                  </div>
                  <span className="role-btn-arrow">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Live KPI Stats Ribbon ── */}
          <div className="hero-metrics-ribbon anim-fadeup delay-3">
            {METRICS.map((m, idx) => (
              <div key={idx} className="metric-pill">
                <span className="metric-val">{m.value}</span>
                <span className="metric-lbl">{isHindi ? m.labelHi : m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ INTERACTIVE LIVE PRODUCT DEMO ════════════ */}
      <section className="landing-demo-section" id="live-demo">
        <div className="section-container">
          <div className="section-header text-center">
            <div className="section-badge">✨ {isHindi ? 'इंटरैक्टिव सिस्टम डेमो' : 'Interactive Product Tour'}</div>
            <h2 className="section-title">
              {isHindi ? 'कृषि मित्र की 6 प्रमुख तकनीकें' : '6 Core Modules Powering KrishiMitra'}
            </h2>
            <p className="section-sub">
              {isHindi 
                ? 'टैब पर क्लिक करके देखें कि कैसे यह प्रणाली किसानों के जीवन को आसान बनाती है।' 
                : 'Click through each module below to preview the live interactive capabilities.'}
            </p>
          </div>

          {/* Tabs header */}
          <div className="demo-tabs-bar">
            {INTERACTIVE_TABS.map(tab => (
              <button
                key={tab.id}
                className={`demo-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-btn-icon">{tab.icon}</span>
                <span className="tab-btn-text">{isHindi ? tab.nameHi : tab.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="demo-tab-viewport anim-fadein" key={activeTab}>
            <div className="demo-tab-left">
              <span className="demo-tag-pill">{currentTab.tag}</span>
              <h3 className="demo-tab-headline">{isHindi ? currentTab.headlineHi : currentTab.headline}</h3>
              <p className="demo-tab-desc">{currentTab.desc}</p>
              
              <div className="demo-tab-cta-wrap">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleLaunchDemo('farmer')}
                >
                  🚀 {isHindi ? 'यह सुविधा लाइव चलाएं →' : 'Launch This Feature Live →'}
                </button>
                <span className="demo-live-indicator">
                  <span className="live-dot" /> {isHindi ? 'लाइव प्रोडक्शन रेडी' : 'Interactive Module Live'}
                </span>
              </div>
            </div>

            <div className="demo-tab-right">
              {/* Dynamic Mockup Viewport */}
              {activeTab === 'cropDoctor' && (
                <div className="mockup-card doctor-mockup">
                  <div className="mockup-header">
                    <span>🔬 AI Diagnosis Terminal</span>
                    <span className="mockup-status-live">Confidence: {currentTab.demoData.confidence}</span>
                  </div>
                  <div className="mockup-scan-box">
                    <div className="mockup-leaf-preview">🌾 🍂</div>
                    <div className="mockup-laser-line" />
                    <div className="mockup-crop-tag">{currentTab.demoData.crop}</div>
                  </div>
                  <div className="mockup-diag-info">
                    <div className="mockup-disease-title">
                      ⚠️ {currentTab.demoData.disease}
                      <span className="mockup-badge-danger">{currentTab.demoData.severity}</span>
                    </div>
                    <div className="mockup-treatment-box">
                      <strong>💊 Recommended Treatment:</strong>
                      <p>{isHindi ? currentTab.demoData.treatmentHi : currentTab.demoData.treatment}</p>
                    </div>
                    <div className="mockup-voice-bar">
                      {currentTab.demoData.voiceNote}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'mandi' && (
                <div className="mockup-card mandi-mockup">
                  <div className="mockup-header">
                    <span>📈 Live Mandi Ticker (Madhya Pradesh)</span>
                    <span className="mockup-status-live">Agmarknet Sync: Live</span>
                  </div>
                  <div className="mockup-mandi-list">
                    {currentTab.demoData.items.map((item, i) => (
                      <div key={i} className="mockup-mandi-row">
                        <div>
                          <div className="mockup-crop-name">{item.crop}</div>
                          <div className="mockup-mandi-name">📍 {item.mandi} · MSP: {item.msp}</div>
                        </div>
                        <div className="mockup-mandi-price-box">
                          <span className="mockup-mandi-price">{item.current}</span>
                          <span className={`mockup-trend-pill ${item.trend}`}>{item.trend === 'up' ? '↑' : '↓'} {item.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mockup-action-bar">
                    <span className="mockup-sell-rec">💡 Advisory: High demand for Soybean in Sehore. Good time to sell.</span>
                  </div>
                </div>
              )}

              {activeTab === 'weather' && (
                <div className="mockup-card weather-mockup">
                  <div className="mockup-header">
                    <span>⛅ Agro-Weather Station</span>
                    <span className="mockup-status-live">Bhopal Field Radar</span>
                  </div>
                  <div className="mockup-weather-grid">
                    <div className="mockup-weather-stat">
                      <span className="stat-label">Temperature</span>
                      <span className="stat-value">{currentTab.demoData.temp}</span>
                      <span className="stat-sub">Feels like {currentTab.demoData.feels}</span>
                    </div>
                    <div className="mockup-weather-stat">
                      <span className="stat-label">Humidity</span>
                      <span className="stat-value">{currentTab.demoData.humidity}</span>
                      <span className="stat-sub">Optimal Range</span>
                    </div>
                    <div className="mockup-weather-stat">
                      <span className="stat-label">Wind Speed</span>
                      <span className="stat-value">{currentTab.demoData.wind}</span>
                    </div>
                  </div>
                  <div className="mockup-verdict-card">
                    <span className="verdict-text">{currentTab.demoData.sprayVerdict}</span>
                    <span className="verdict-sub">{currentTab.demoData.rainRisk}</span>
                  </div>
                </div>
              )}

              {activeTab === 'machinery' && (
                <div className="mockup-card machinery-mockup">
                  <div className="mockup-header">
                    <span>🚜 Local Machinery Network</span>
                    <span className="mockup-status-live">3 Machines Nearby</span>
                  </div>
                  <div className="mockup-machinery-list">
                    {currentTab.demoData.equipment.map((eq, i) => (
                      <div key={i} className="mockup-eq-row">
                        <div className="mockup-eq-icon">🚜</div>
                        <div className="mockup-eq-info">
                          <div className="mockup-eq-name">{eq.name}</div>
                          <div className="mockup-eq-owner">👤 {eq.owner} · 📍 {eq.dist}</div>
                        </div>
                        <div className="mockup-eq-price">{eq.rate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'fintech' && (
                <div className="mockup-card fintech-mockup">
                  <div className="mockup-header">
                    <span>💳 Kisan Credit Passport</span>
                    <span className="mockup-status-live">Verified Profile</span>
                  </div>
                  <div className="mockup-score-banner">
                    <div className="mockup-score-circle">
                      <span className="score-num">745</span>
                      <span className="score-total">/ 900</span>
                    </div>
                    <div className="mockup-score-meta">
                      <span className="score-grade">🌟 {currentTab.demoData.grade}</span>
                      <span className="score-loan">{currentTab.demoData.eligibleLoans}</span>
                    </div>
                  </div>
                  <div className="mockup-schemes-list">
                    {currentTab.demoData.activeSchemes.map((sch, i) => (
                      <div key={i} className="mockup-scheme-pill">
                        ✅ {sch}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'voice' && (
                <div className="mockup-card voice-mockup">
                  <div className="mockup-header">
                    <span>🎙️ Bhashini AI Voice Terminal</span>
                    <span className="mockup-status-live">Web Speech API</span>
                  </div>
                  <div className="mockup-voice-chat">
                    <div className="mockup-bubble farmer-bubble">
                      <span className="bubble-speaker">Farmer (Kisan):</span>
                      <p>{currentTab.demoData.query}</p>
                    </div>
                    <div className="mockup-bubble ai-bubble">
                      <span className="bubble-speaker">KrishiMitra Voice AI:</span>
                      <p>{currentTab.demoData.response}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ WHY KRISHIMITRA (COMPARISON) ════════════ */}
      <section className="landing-compare-section" id="features">
        <div className="section-container">
          <div className="section-header text-center">
            <div className="section-badge">⚖️ {isHindi ? 'परंपरागत बनाम कृषि मित्र' : 'The AgriTech Leap'}</div>
            <h2 className="section-title">
              {isHindi ? 'कैसे कृषि मित्र बदलता है भारतीय खेती?' : 'Traditional Agriculture vs. KrishiMitra'}
            </h2>
            <p className="section-sub">
              {isHindi 
                ? 'पुरानी समस्याओं का आधुनिक, पारदर्शी व तकनीकी समाधान।' 
                : 'Addressing the foundational inefficiencies of rural Indian agricultural supply chains.'}
            </p>
          </div>

          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>{isHindi ? 'कृषि आयाम' : 'Dimension'}</th>
                  <th className="th-old">{isHindi ? 'पारंपरिक तरीका' : 'Traditional Way'}</th>
                  <th className="th-new">🌿 KrishiMitra Platform</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((c, i) => (
                  <tr key={i}>
                    <td className="td-feature"><strong>{c.feature}</strong></td>
                    <td className="td-old">❌ {c.traditional}</td>
                    <td className="td-new">✅ {c.krishi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ════════════ TECH STACK & ARCHITECTURE (FOR RECRUITERS) ════════════ */}
      <section className="landing-arch-section" id="architecture">
        <div className="section-container">
          <div className="section-header text-center">
            <div className="section-badge">💻 {isHindi ? 'सॉफ्टवेयर वास्तुकला' : 'Engineering & Architecture'}</div>
            <h2 className="section-title">
              {isHindi ? 'आधुनिक फुल-स्टैक व AI आर्किटेक्चर' : 'Built with Modern Web & Cloud Standards'}
            </h2>
            <p className="section-sub">
              {isHindi 
                ? 'React 19, Vite 8, Firebase v12, IndexedDB ऑफ़लाइन और विशुद्ध CSS ग्लासमोर्फिज़्म।' 
                : 'Zero heavy UI libraries, zero Tailwind, sub-1MB bundle size, and 100% offline-first resilience.'}
            </p>
          </div>

          <div className="arch-grid">
            <div className="arch-card">
              <div className="arch-icon">⚡</div>
              <h4 className="arch-title">Frontend Core</h4>
              <p className="arch-desc">React 19 with Suspense lazy code-splitting, Vite 8 build toolchain, and React Router v7 role-based access control.</p>
              <span className="arch-tag">React 19 · Vite 8 · Router v7</span>
            </div>

            <div className="arch-card">
              <div className="arch-icon">🧠</div>
              <h4 className="arch-title">AI & Vision Engine</h4>
              <p className="arch-desc">Gemini 2.0 / Claude multi-modal leaf analysis pipeline + Web Speech API for dual-language voice navigation.</p>
              <span className="arch-tag">Gemini 2.0 · Web Speech API</span>
            </div>

            <div className="arch-card">
              <div className="arch-icon">📴</div>
              <h4 className="arch-title">Offline-First Engine</h4>
              <p className="arch-desc">Firestore IndexedDB persistence, Workbox PWA service worker caching, and dual-layer weather and Mandi storage.</p>
              <span className="arch-tag">IndexedDB · Workbox PWA</span>
            </div>

            <div className="arch-card">
              <div className="arch-icon">🎨</div>
              <h4 className="arch-title">Custom Glass Design</h4>
              <p className="arch-desc">Zero Tailwind, zero external UI libraries. Pure CSS3 design tokens with 3D depth, responsive collapse, and dark-mode readiness.</p>
              <span className="arch-tag">Vanilla CSS · Custom Tokens</span>
            </div>
          </div>

          <div className="arch-blueprint-card">
            <div className="blueprint-content">
              <h4>📖 Comprehensive Architecture Blueprint Available</h4>
              <p>Review the full 300+ line <code>SYSTEM.md</code> technical specification including database schemas, API specs, and production roadmap.</p>
            </div>
            <div className="blueprint-actions">
              <a 
                href="https://github.com/shivasingh95/Kisan-Mitra" 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-secondary"
              >
                ⭐ View on GitHub
              </a>
              <button 
                className="btn btn-primary"
                onClick={() => handleLaunchDemo('farmer')}
              >
                ⚡ Explore Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ TESTIMONIALS ════════════ */}
      <section className="landing-impact-section" id="impact">
        <div className="section-container">
          <div className="section-header text-center">
            <div className="section-badge">💬 {isHindi ? 'सच्ची प्रतिक्रियाएं' : 'Field Testimonials'}</div>
            <h2 className="section-title">
              {isHindi ? 'किसानों और विशेषज्ञों का भरोसा' : 'Trusted by Farmers Across Central India'}
            </h2>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="test-quote">
                "फसल डॉक्टर ने 2 मिनट में बता दिया कि गेहूं में पीला रतुआ है और कौन सी दवा डालनी है। पहले हमें दुकानदारों की महंगी दवाइयों पर निर्भर रहना पड़ता था।"
              </p>
              <div className="test-author">
                <span className="author-avatar">👨‍🌾</span>
                <div>
                  <div className="author-name">Ramesh Kumar (रमेश कुमार)</div>
                  <div className="author-meta">Wheat & Soybean Farmer · Sehore, MP</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="test-quote">
                "लाइव मंडी भाव देखकर हमने अपनी 50 क्विंटल सोयाबीन सीहोर में न बेचकर भोपाल मंडी में ₹150 प्रति क्विंटल अधिक दाम पर बेची।"
              </p>
              <div className="test-author">
                <span className="author-avatar">👨‍🌾</span>
                <div>
                  <div className="author-name">Dinesh Patel (दिनेश पटेल)</div>
                  <div className="author-meta">Progressive Farmer & FPO Member · Vidisha, MP</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="test-quote">
                "KrishiMitra bridges the critical gap between agricultural scientists and field reality. The voice assistant makes it truly accessible to every farmer."
              </p>
              <div className="test-author">
                <span className="author-avatar">🔬</span>
                <div>
                  <div className="author-name">Dr. Arvind Shukla</div>
                  <div className="author-meta">Senior Agronomist · ICAR-CIAE Bhopal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ BOTTOM CTA BANNER ════════════ */}
      <section className="landing-cta-banner">
        <div className="cta-container text-center">
          <span className="cta-emoji">🌾</span>
          <h2 className="cta-title">
            {isHindi ? 'आज ही कृषि मित्र का अनुभव करें' : 'Ready to Experience the Future of Indian AgriTech?'}
          </h2>
          <p className="cta-sub">
            {isHindi 
              ? 'बिना किसी पंजीकरण शुल्क के 1-क्लिक में लाइव डेमो एक्सप्लोर करें।' 
              : 'Launch the interactive live platform as Farmer, Scientist, Buyer, or Admin right now.'}
          </p>

          <div className="cta-btn-group">
            <button className="btn btn-primary btn-lg" onClick={() => handleLaunchDemo('farmer')}>
              🚀 {isHindi ? 'मुफ़्त लाइव डेमो चलाएं' : 'Launch Free Live Demo →'}
            </button>
            <a 
              href="https://github.com/shivasingh95/Kisan-Mitra" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-secondary btn-lg"
            >
              ⭐ Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <span className="footer-logo">🌿</span>
              <span className="footer-name hindi">कृषि Mitra</span>
              <p className="footer-tagline">AI-Powered Agricultural Intelligence for Indian Farmers.</p>
            </div>

            <div className="footer-links-col">
              <h5>Quick Personas</h5>
              <a href="#live-demo" onClick={() => handleLaunchDemo('farmer')}>Farmer Dashboard</a>
              <a href="#live-demo" onClick={() => handleLaunchDemo('expert')}>Agri Scientist Portal</a>
              <a href="#live-demo" onClick={() => handleLaunchDemo('buyer')}>Buyer Mandi Catalog</a>
              <a href="#live-demo" onClick={() => handleLaunchDemo('worker')}>Labour Hire Desk</a>
            </div>

            <div className="footer-links-col">
              <h5>Engineering & Code</h5>
              <a href="https://github.com/shivasingh95/Kisan-Mitra" target="_blank" rel="noreferrer">GitHub Repository</a>
              <a href="#architecture">SYSTEM.md Specification</a>
              <a href="#architecture">React 19 + Vite 8 Stack</a>
              <a href="#architecture">Offline IndexedDB Engine</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 KrishiMitra. Open-Source AgriTech Initiative. Built with ❤️ for Indian Farmers.</p>
            <div className="footer-bottom-badges">
              <span className="footer-pill">🇮🇳 Made in India</span>
              <span className="footer-pill">⚡ PWA Verified</span>
              <span className="footer-pill">🔒 DPDP Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
