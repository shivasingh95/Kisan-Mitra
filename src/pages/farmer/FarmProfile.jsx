import React from 'react';
import './pages.css';

const PROFILE = {
  name: 'Ramesh Kumar', nameHi: 'रमेश कुमार',
  phone: '+91 98765 43210',
  village: 'Sehore', district: 'Sehore', state: 'Madhya Pradesh',
  landAcres: 5.5,
  crops: ['Wheat 🌾', 'Rice 🍚', 'Tomato 🍅'],
  subscription: 'Pro — ₹299/mo',
  memberSince: 'March 2023',
  creditScore: 742,
};

const HISTORY = [
  { type: 'Diagnosis',    icon: '🔬', label: 'Wheat Rust detected', date: '8 May', status: 'Resolved', color: '#16A34A' },
  { type: 'Sale',         icon: '💰', label: 'Wheat sold — 20 qtl @ ₹2150', date: '5 May', status: 'Completed', color: '#2563EB' },
  { type: 'Expert',       icon: '👨‍💼', label: 'Dr. Arvind Sharma — Free Demo', date: '3 May', status: 'Done', color: '#8B5CF6' },
  { type: 'Scheme',       icon: '🏛️', label: 'PM-KISAN 14th instalment', date: '28 Apr', status: '₹2000 credited', color: '#F59E0B' },
  { type: 'Diagnosis',    icon: '🔬', label: 'Tomato Blight — Mid severity', date: '2 May', status: 'Pending', color: '#D97706' },
];

export default function FarmProfile() {
  return (
    <div className="anim-page">
      <div className="dashboard-greeting">
        <div>
          <h1 className="page-title">👤 Meri Profile</h1>
          <p className="page-sub hindi">Aapki sabhi jaankari aur itihas ek jagah</p>
        </div>
        <button className="btn btn-secondary">✏️ Edit Profile</button>
      </div>

      <div className="profile-layout">
        {/* Profile Card */}
        <div className="profile-left">
          <div className="card anim-fadeup delay-1 text-center" style={{ padding: '32px 24px' }}>
            <div style={{ fontSize: 72, marginBottom: 12 }}>👨‍🌾</div>
            <h2 style={{ fontWeight: 800, fontSize: 'var(--text-2xl)', marginBottom: 2 }}>{PROFILE.name}</h2>
            <div className="hindi" style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', marginBottom: 16 }}>{PROFILE.nameHi}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              <span className="badge badge-primary">👷 Farmer</span>
              <span className="badge badge-green">✓ Verified</span>
              <span className="badge badge-blue">Pro</span>
            </div>
            <div style={{ background: 'var(--primary-ghost)', borderRadius: 14, padding: 16, textAlign: 'left' }}>
              {[
                ['📱', PROFILE.phone],
                ['📍', `${PROFILE.village}, ${PROFILE.district}, ${PROFILE.state}`],
                ['🌾', `${PROFILE.landAcres} acres land`],
                ['📅', `Member since ${PROFILE.memberSince}`],
                ['💳', PROFILE.subscription],
              ].map(([icon, val]) => (
                <div key={val} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  <span>{icon}</span><span>{val}</span>
                </div>
              ))}
            </div>

            {/* My Crops */}
            <div style={{ marginTop: 16, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 8 }}>Meri Faslen</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PROFILE.crops.map(c => <span key={c} className="badge badge-primary">{c}</span>)}
              </div>
            </div>

            {/* Credit Score */}
            <div style={{ marginTop: 16, background: 'linear-gradient(135deg, var(--green-800), var(--green-700))', borderRadius: 12, padding: 16, color: '#fff', textAlign: 'left' }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Kisan Credit Score</div>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 900 }}>{PROFILE.creditScore}</div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 99, marginTop: 8 }}>
                <div style={{ width: '74.2%', height: '100%', background: '#74C69D', borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>Good — Eligible for KCC Loan</div>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="profile-right">
          <div className="card anim-fadeup delay-2">
            <div className="section-header"><div className="section-title">📜 Recent Activity</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {HISTORY.map((h, i) => (
                <div key={i} className={`anim-fadeup delay-${i + 1}`} style={{
                  display: 'flex', gap: 14, padding: '12px 14px',
                  background: 'var(--bg-main)', borderRadius: 12,
                  borderLeft: `3px solid ${h.color}`
                }}>
                  <span style={{ fontSize: 24 }}>{h.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{h.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{h.type} · {h.date}</div>
                  </div>
                  <span style={{ background: `${h.color}18`, color: h.color, padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', alignSelf: 'center' }}>
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            {[
              { icon: '🔬', label: 'Diagnoses', value: '12', sub: 'Fasal scans' },
              { icon: '💰', label: 'Total Sales', value: '₹1.8L', sub: 'This season' },
              { icon: '👨‍💼', label: 'Expert Sessions', value: '4', sub: '2 free, 2 paid' },
              { icon: '🏛️', label: 'Schemes Active', value: '3', sub: 'Benefits milti hai' },
            ].map((s, i) => (
              <div key={i} className={`card stat-card anim-fadeup delay-${i + 3}`}>
                <div className="stat-icon-wrap" style={{ background: 'var(--primary-pale)', color: 'var(--primary)', fontSize: 22 }}>
                  {s.icon}
                </div>
                <div className="stat-body">
                  <span className="stat-label">{s.label}</span>
                  <div className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>{s.value}</div>
                  <span className="stat-sub">{s.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
