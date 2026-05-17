import React, { useState, useRef, useEffect } from 'react';
import './pages.css';
import { analyzeCropImage } from '../../services/cropDoctor';
import { saveScanResult, getScanHistory } from '../../services/db';
import { useApp } from '../../context/AppContext';

// Demo disease buttons (still shown on idle screen as quick examples)
const DEMO_DISEASES = [
  {
    name: 'Wheat Rust (Stripe)',     nameHi: 'गेहूं का रस्ट',
    crop: 'Wheat 🌾',
    severity: 'High',    severityColor: '#D97706',
    confidence: 94,
    desc: 'Yellow stripe rust caused by Puccinia striiformis. Powdery yellow stripes appear along leaf veins.',
    treatment: ['Propiconazole 25% EC @ 0.1% spray', 'Use resistant variety HD-2781', 'Remove infected debris', 'Avoid excess nitrogen'],
    prevention: 'Plant rust-resistant varieties. Maintain 20cm row spacing.',
    hindiVoice: 'Aapki fasal mein gehun ka rust hua hai. Propiconazole spray kijiye.',
  },
  {
    name: 'Rice Blast',              nameHi: 'धान का ब्लास्ट',
    crop: 'Rice 🍚',
    severity: 'Critical', severityColor: '#DC2626',
    confidence: 89,
    desc: 'Fungal disease by Magnaporthe oryzae. Diamond-shaped grey lesions on leaves.',
    treatment: ['Tricyclazole 75% WP @ 0.6 g/litre', 'Isoprothiolane 40 EC @ 1.5 ml/litre', 'Drain fields temporarily', 'Split nitrogen application'],
    prevention: 'Use certified disease-free seeds. Avoid dense planting.',
    hindiVoice: 'Aapke dhan mein blast rog hai. Tricyclazole ka chidkav karein.',
  },
  {
    name: 'Tomato Leaf Curl Virus',  nameHi: 'टमाटर पत्ता मरोड़',
    crop: 'Tomato 🍅',
    severity: 'Medium',  severityColor: '#F59E0B',
    confidence: 87,
    desc: 'Begomovirus transmitted by whitefly. Leaves curl upward, yellow margins, plant stunted.',
    treatment: ['Remove infected plants immediately', 'Imidacloprid 17.8 SL @ 0.3 ml/litre', 'Neem oil 5ml/litre spray weekly', 'Yellow sticky traps @ 15/acre'],
    prevention: 'Use TYLCV-resistant varieties. Install insect-proof nets.',
    hindiVoice: 'Aapke tamatar mein patta marod virus hai. Sankramit paudhe hataiye.',
  },
];

function SeverityBadge({ level, color }) {
  return (
    <span style={{ background: `${color}18`, color, border: `1px solid ${color}44`, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {level}
    </span>
  );
}

function VoiceBtn({ text }) {
  const [speaking, setSpeaking] = useState(false);
  const speak = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN';
    u.rate = 0.9;
    setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };
  return (
    <button className="btn btn-secondary btn-sm" onClick={speak}>
      {speaking ? '🔊 Bol raha hai…' : '🔈 Hindi mein suno'}
    </button>
  );
}

export default function CropDoctor() {
  const { firebaseUser, showToast } = useApp();
  const [stage, setStage] = useState('idle'); // idle | analyzing | result | error
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('treatment');
  const [dragOver, setDragOver] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const [history, setHistory] = useState([]);
  const fileRef = useRef();

  // Load scan history from Firestore on mount
  useEffect(() => {
    if (!firebaseUser?.uid || firebaseUser.uid === 'demo') return;
    getScanHistory(firebaseUser.uid)
      .then(records => setHistory(records))
      .catch(() => {}); // silently fail if offline
  }, [firebaseUser]);

  // ── Real AI analysis ─────────────────────────────────────
  const runAnalysis = async (file) => {
    setStage('analyzing');
    // Animate scan line while waiting
    const iv = setInterval(() => setScanLine(l => (l + 2) % 100), 30);
    try {
      const aiResult = await analyzeCropImage(file);
      clearInterval(iv);
      setResult(aiResult);
      setStage('result');
      // Save to Firestore (only for real users, not demo)
      if (firebaseUser?.uid && firebaseUser.uid !== 'demo') {
        await saveScanResult(firebaseUser.uid, {
          name: aiResult.name,
          crop: aiResult.crop,
          severity: aiResult.severity,
          confidence: aiResult.confidence,
        });
        // Refresh history
        const updated = await getScanHistory(firebaseUser.uid);
        setHistory(updated);
      }
    } catch (err) {
      clearInterval(iv);
      console.error('AI analysis failed:', err);
      setStage('idle');
      showToast('AI analysis failed. Check internet & retry.', 'error');
    }
  };

  const handleFile = (file) => {
    if (!file?.type.startsWith('image/')) {
      showToast('Please upload an image file (JPG, PNG, WEBP)', 'error');
      return;
    }
    setPreview(URL.createObjectURL(file));
    runAnalysis(file); // pass actual File object to Gemini
  };

  const reset = () => { setStage('idle'); setResult(null); setPreview(null); setActiveTab('treatment'); };

  return (
    <div className="crop-doctor anim-page">
      <div className="dashboard-greeting">
        <div>
          <h1 className="page-title">🔬 Crop Doctor AI</h1>
          <p className="page-sub hindi">Fasal ki photo lo → bimaari pakdo → ilaaj jaano</p>
        </div>
        {stage === 'result' && (
          <button className="btn btn-secondary" onClick={reset}>+ Naya Scan</button>
        )}
      </div>

      <div className="doctor-layout">
        {/* Main area */}
        <div className="doctor-main">
          {stage === 'idle' && (
            <div className="card anim-fadeup delay-1">
              {/* Upload Zone */}
              <div
                className={`upload-zone ${dragOver ? 'drag-active' : ''}`}
                onClick={() => fileRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              >
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                <div className="upload-icon">📸</div>
                <h3>Fasal ki Photo Upload Karo</h3>
                <p>Drag & drop ya click karke browse karo</p>
                <span className="upload-hint">JPG, PNG, WEBP — Max 20 MB</span>
                <button className="btn btn-primary" style={{ marginTop: 16 }}>
                  📂 File Choose Karo
                </button>
              </div>

              <div className="divider-text">ya quick demo try karo</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {DEMO_DISEASES.map(d => (
                  <button
                    key={d.name}
                    className="demo-disease-btn card-flat card"
                    onClick={() => { setResult(d); setStage('result'); }}
                    style={{ '--d-color': d.severityColor }}
                  >
                    <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 20 }}>{d.crop.split(' ')[1]}</span>
                      <SeverityBadge level={d.severity} color={d.severityColor} />
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-900)' }}>{d.name}</div>
                    <div className="hindi" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.nameHi}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {stage === 'analyzing' && (
            <div className="card anim-scalein">
              <div className="analyzing-wrapper">
                <div className="scan-container">
                  {preview && <img src={preview} alt="crop" className="scan-img" />}
                  <div className="scan-overlay">
                    <div className="scan-line" style={{ top: `${scanLine}%` }} />
                    <div className="scan-corner tl" /><div className="scan-corner tr" />
                    <div className="scan-corner bl" /><div className="scan-corner br" />
                  </div>
                </div>
                <div className="analyzing-info">
                  <div className="ai-spinner">
                    <div className="spinner-ring" />
                    <span>🔬</span>
                  </div>
                  <h3 className="hindi">AI Analysis ho rahi hai…</h3>
                  <p>Disease patterns, severity aur treatment identify ho raha hai</p>
                  <div className="scan-steps">
                    {['Image preprocess kar raha hai', 'Disease model run ho rahi hai', 'Treatment plan generate ho raha hai'].map((s, i) => (
                      <div key={i} className={`scan-step anim-fadeup delay-${i + 2}`}>
                        <div className="scan-dot-anim" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {stage === 'result' && result && (
            <div className="anim-page">
              {/* Result header */}
              <div className="card result-header-card" style={{ borderLeft: `4px solid ${result.severityColor}`, marginBottom: 16 }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                  <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{result.name}</h2>
                    <SeverityBadge level={result.severity} color={result.severityColor} />
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={reset}>✕ Close</button>
                </div>
                <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Crop: <b>{result.crop}</b></span>
                  <span className="hindi" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{result.nameHi}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="progress-bar" style={{ width: 80 }}>
                      <div className="progress-fill" style={{ width: `${result.confidence}%`, background: result.severityColor }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: result.severityColor }}>{result.confidence}% confidence</span>
                  </div>
                  <VoiceBtn text={result.hindiVoice} />
                </div>
                <p style={{ marginTop: 12, fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-muted)' }}>{result.desc}</p>
              </div>

              {/* Tabs */}
              <div className="card">
                <div className="pill-group" style={{ marginBottom: 16 }}>
                  {['treatment', 'prevention'].map(t => (
                    <button key={t} className={`pill ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                      {t === 'treatment' ? '💊 Treatment Steps' : '🛡️ Prevention'}
                    </button>
                  ))}
                </div>

                {activeTab === 'treatment' ? (
                  <ul className="treatment-steps">
                    {result.treatment.map((step, i) => (
                      <li key={i} className={`treatment-step anim-fadeup delay-${i + 1}`}>
                        <span className="step-num">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="prevention-box">
                    <span style={{ fontSize: 32 }}>🛡️</span>
                    <p>{result.prevention}</p>
                  </div>
                )}

                <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary">👨‍💼 Expert se consult karo</button>
                  <button className="btn btn-secondary">📋 Report download karo</button>
                  <button className="btn btn-ghost" onClick={reset}>📸 Dobaara scan karo</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="doctor-sidebar">
          <div className="card anim-fadeup delay-2">
            <div className="section-header"><div className="section-title">📅 Scan History</div></div>
            {history.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: 13 }}>Koi purana scan nahi mila.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map((h, i) => (
                  <div key={h.id || i} className="card-flat card" style={{ padding: '12px' }}>
                    <div className="flex justify-between items-center">
                      <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{h.crop || h.name}</span>
                      <span className={`badge ${h.severity === 'None' ? 'badge-green' : 'badge-amber'}`}>
                        {h.severity === 'None' ? '✓ Healthy' : `⚠️ ${h.severity}`}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {h.name} · {h.date?.toDate ? h.date.toDate().toLocaleDateString('en-IN') : 'Recent'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card anim-fadeup delay-3" style={{ marginTop: 16 }}>
            <div className="section-header"><div className="section-title">💡 Disease Season Alert</div></div>
            <div className="alert-item alert-warning hindi" style={{ fontSize: 13 }}>
              ⚠️ Is mauke mein gehun ka rust aur dhaan ka blast zyada active hai. Niyamit jaanch karein.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
