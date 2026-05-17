import React, { useState, useRef } from 'react';
import { UploadCloud, Search, Camera, Leaf, AlertTriangle, CheckCircle, RefreshCw, X } from 'lucide-react';

const diseases = [
  {
    name: 'Wheat Rust (Stripe)',
    crop: 'Wheat',
    severity: 'High',
    description: 'Yellow stripe rust caused by Puccinia striiformis. Appears as yellow powdery stripes on leaves.',
    treatment: [
      'Apply Propiconazole 25% EC @ 0.1% at first sign',
      'Use resistant varieties like HD-2781',
      'Remove and destroy infected plant debris',
      'Avoid excess nitrogen fertilization',
    ],
    prevention: 'Plant rust-resistant varieties and ensure proper spacing for airflow.',
    color: '#FF9800',
  },
  {
    name: 'Rice Blast',
    crop: 'Rice',
    severity: 'Critical',
    description: 'Fungal disease caused by Magnaporthe oryzae. Diamond-shaped lesions on leaves, neck rot.',
    treatment: [
      'Spray Tricyclazole 75% WP @ 0.6 g/litre',
      'Apply Isoprothiolane 40 EC @ 1.5 ml/litre',
      'Drain fields temporarily to reduce humidity',
      'Avoid late nitrogen application',
    ],
    prevention: 'Use certified disease-free seeds and balanced fertilization.',
    color: '#F44336',
  },
  {
    name: 'Tomato Leaf Curl',
    crop: 'Tomato',
    severity: 'Medium',
    description: 'Viral disease transmitted by whiteflies. Leaves curl upward with yellowing and stunting.',
    treatment: [
      'Control whitefly vectors with Imidacloprid',
      'Remove and destroy infected plants',
      'Apply reflective mulches to deter whiteflies',
      'Use neem oil spray (5ml/litre) weekly',
    ],
    prevention: 'Install insect-proof nets and use resistant varieties.',
    color: '#FF5722',
  },
];

const commonCrops = ['Wheat', 'Rice', 'Maize', 'Tomato', 'Potato', 'Onion', 'Soybean', 'Cotton'];

function SeverityBadge({ level }) {
  const colors = { High: '#FF9800', Critical: '#F44336', Medium: '#FFC107', Low: '#4CAF50' };
  return (
    <span className="severity-badge" style={{ background: `${colors[level]}22`, color: colors[level], border: `1px solid ${colors[level]}55` }}>
      {level}
    </span>
  );
}

function AnalysisResult({ disease, onReset }) {
  const [activeTab, setActiveTab] = useState('treatment');
  return (
    <div className="result-card fade-in">
      <div className="result-header" style={{ borderLeft: `4px solid ${disease.color}` }}>
        <div>
          <div className="result-title-row">
            <h3>{disease.name}</h3>
            <SeverityBadge level={disease.severity} />
          </div>
          <span className="result-crop">Crop: {disease.crop}</span>
        </div>
        <button className="icon-btn" onClick={onReset} title="Scan another"><X size={18} /></button>
      </div>

      <p className="result-desc">{disease.description}</p>

      <div className="result-tabs">
        {['treatment', 'prevention'].map(t => (
          <button
            key={t}
            className={`tab-btn ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'treatment' ? (
        <ul className="treatment-list">
          {disease.treatment.map((step, i) => (
            <li key={i}><CheckCircle size={14} className="check-icon" />{step}</li>
          ))}
        </ul>
      ) : (
        <div className="prevention-box">
          <Leaf size={16} />
          <p>{disease.prevention}</p>
        </div>
      )}

      <button className="btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={onReset}>
        <RefreshCw size={16} /> Scan Another Crop
      </button>
    </div>
  );
}

export default function CropDoctor() {
  const [stage, setStage] = useState('idle'); // idle | analyzing | result
  const [result, setResult] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    runAnalysis();
  };

  const runAnalysis = () => {
    setStage('analyzing');
    setTimeout(() => {
      const picked = diseases[Math.floor(Math.random() * diseases.length)];
      setResult(picked);
      setStage('result');
    }, 2500);
  };

  const reset = () => {
    setStage('idle');
    setResult(null);
    setPreview(null);
  };

  return (
    <div className="crop-doctor-layout fade-in">
      <div className="doctor-header">
        <div className="doctor-title-block">
          <div className="doctor-icon-circle">
            <Leaf size={24} />
          </div>
          <div>
            <h2>Crop Doctor AI</h2>
            <p>Upload a photo of your crop to detect diseases instantly</p>
          </div>
        </div>
        <div className="crop-pills">
          {commonCrops.map(c => (
            <button
              key={c}
              className={`crop-pill ${selectedCrop === c ? 'active' : ''}`}
              onClick={() => setSelectedCrop(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {stage === 'idle' && (
        <div className="doctor-body">
          {/* Upload Zone */}
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
            <div className="upload-icon-wrap">
              <UploadCloud size={40} />
            </div>
            <h3>Upload Crop Photo</h3>
            <p>Drag & drop or click to browse</p>
            <span className="upload-hint">Supports JPG, PNG, WEBP</span>
          </div>

          <div className="or-divider"><span>OR</span></div>

          {/* Quick Demo */}
          <div className="quick-demo-section">
            <h4>Try a quick demo</h4>
            <p>Select a known disease to see the diagnosis:</p>
            <div className="demo-grid">
              {diseases.map(d => (
                <button
                  key={d.name}
                  className="demo-card"
                  style={{ borderColor: `${d.color}55` }}
                  onClick={() => { setResult(d); setStage('result'); }}
                >
                  <AlertTriangle size={16} style={{ color: d.color }} />
                  <div>
                    <span className="demo-name">{d.name}</span>
                    <SeverityBadge level={d.severity} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {stage === 'analyzing' && (
        <div className="analyzing-state fade-in">
          {preview && <img src={preview} alt="analyzing" className="preview-img" />}
          <div className="spinner-ring" />
          <h3 className="analyzing-text">Analyzing your crop…</h3>
          <p>AI is scanning for diseases, pests & deficiencies</p>
          <div className="scan-steps">
            {['Preprocessing image', 'Running disease model', 'Generating treatment plan'].map((s, i) => (
              <div key={i} className="scan-step-item" style={{ animationDelay: `${i * 0.6}s` }}>
                <div className="scan-dot" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === 'result' && result && (
        <div className="doctor-body">
          <AnalysisResult disease={result} onReset={reset} />

          <div className="card tip-card fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="section-header">
              <Search size={18} />
              <h4>Preventive Tips for Next Season</h4>
            </div>
            <ul className="tips-list">
              <li>🌱 Rotate crops yearly to break disease cycles</li>
              <li>💧 Use drip irrigation to reduce leaf wetness</li>
              <li>🧪 Conduct soil testing every 2 years</li>
              <li>🌡️ Monitor weather alerts for disease-favorable conditions</li>
              <li>📦 Store seeds properly in cool, dry conditions</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
