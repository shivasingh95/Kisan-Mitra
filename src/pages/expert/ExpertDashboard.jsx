import React, { useState } from 'react';
import './pages.css';

const SESSIONS = [
  { id: 1, farmer: 'Ramesh Kumar',   hi: 'रमेश कुमार',  avatar: '👨‍🌾', type: 'free',  topic: 'Wheat Rust identification', time: '10:30 AM Today',   status: 'upcoming', amount: 0 },
  { id: 2, farmer: 'Sunita Devi',    hi: 'सुनीता देवी',  avatar: '👩‍🌾', type: 'paid',  topic: 'Rice blast treatment plan',  time: '2:00 PM Today',    status: 'upcoming', amount: 299 },
  { id: 3, farmer: 'Mohan Patel',    hi: 'मोहन पटेल',   avatar: '👨‍🌾', type: 'paid',  topic: 'Organic tomato farming',     time: '9 May 4:00 PM',   status: 'completed', amount: 299 },
  { id: 4, farmer: 'Priya Sharma',   hi: 'प्रिया शर्मा', avatar: '👩‍🌾', type: 'free',  topic: 'Soil test interpretation',   time: '8 May 11:00 AM',  status: 'completed', amount: 0 },
];

const QUESTIONS = [
  { id: 1, farmer: 'Ashok Kumar', question: 'Mere gehun ke patte peele kyon ho rahe hain?', topic: 'Wheat', time: '1h ago', urgent: true },
  { id: 2, farmer: 'Geeta Bai',   question: 'Drip irrigation ke liye kaunsa pipe best hai?', topic: 'Irrigation', time: '3h ago', urgent: false },
];

const EARNINGS = { total: 48600, pending: 8800, withdrawn: 39800, platformCut: 12150, thisMonth: 9600 };

export default function ExpertDashboard() {
  const [tab, setTab] = useState('sessions');
  const [accepted, setAccepted] = useState([]);
  const [answered, setAnswered] = useState([]);

  const upcoming = SESSIONS.filter(s => s.status === 'upcoming');
  const completed = SESSIONS.filter(s => s.status === 'completed');

  return (
    <div className="anim-page">
      <div className="dashboard-greeting">
        <div>
          <h1 className="page-title">📊 Expert Dashboard</h1>
          <p className="page-sub hindi">Namaskar Dr. Arvind — Aapke aaj ke sessions aur kamaai</p>
        </div>
        <div className="badge badge-green" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>
          <span className="live-dot" style={{ marginRight: 6 }} />Available
        </div>
      </div>

      {/* Earning stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { icon: '💰', label: 'Total Earned',    value: `₹${(EARNINGS.total/1000).toFixed(1)}K`, color: '#16A34A' },
          { icon: '⏳', label: 'This Month',      value: `₹${(EARNINGS.thisMonth/1000).toFixed(1)}K`, color: '#2563EB' },
          { icon: '🔄', label: 'Pending Payout',  value: `₹${(EARNINGS.pending/1000).toFixed(1)}K`, color: '#D97706' },
          { icon: '📅', label: 'Total Sessions',  value: SESSIONS.length, color: '#8B5CF6' },
        ].map((s, i) => (
          <div key={i} className={`card stat-card anim-fadeup delay-${i + 1}`}>
            <div className="stat-icon-wrap" style={{ background: `${s.color}18`, color: s.color }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <div className="stat-body">
              <span className="stat-label">{s.label}</span>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="pill-group" style={{ marginBottom: 20 }}>
        {['sessions', 'questions', 'earnings'].map(t => (
          <button key={t} className={`pill ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'sessions' ? '📅 Sessions' : t === 'questions' ? '❓ Questions' : '💰 Earnings'}
          </button>
        ))}
      </div>

      {tab === 'sessions' && (
        <div>
          <div className="section-header"><div className="section-title">🕐 Upcoming Sessions</div></div>
          <div className="grid-2" style={{ marginBottom: 24 }}>
            {upcoming.map((s, i) => (
              <div key={s.id} className={`card card-3d anim-fadeup delay-${i + 1}`}>
                <div className="flex gap-3 items-center" style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 36 }}>{s.avatar}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{s.farmer}</div>
                    <div className="hindi" style={{ fontSize: 12, color: 'var(--text-light)' }}>{s.hi}</div>
                    <span className={`badge ${s.type === 'free' ? 'badge-blue' : 'badge-green'}`}>
                      {s.type === 'free' ? '🎁 Free Demo' : `💰 Paid — ₹${s.amount}`}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 12 }}>
                  <div>📚 {s.topic}</div>
                  <div>🕐 {s.time}</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className={`btn btn-full ${accepted.includes(s.id) ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={() => setAccepted(a => [...a, s.id])}
                    disabled={accepted.includes(s.id)}
                  >
                    {accepted.includes(s.id) ? '✓ Accepted' : '✓ Accept'}
                  </button>
                  <button className="btn btn-secondary btn-sm">🎥 Join Call</button>
                </div>
              </div>
            ))}
          </div>

          <div className="section-header"><div className="section-title">✅ Completed Sessions</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {completed.map(s => (
              <div key={s.id} className="card card-flat" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 28 }}>{s.avatar}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{s.farmer}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.topic} · {s.time}</div>
                </div>
                <span className={`badge ${s.type === 'free' ? 'badge-blue' : 'badge-green'}`}>
                  {s.type === 'free' ? 'Free' : `+₹${s.amount}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {QUESTIONS.map((q, i) => (
            <div key={q.id} className={`card anim-fadeup delay-${i + 1}`}>
              <div className="flex justify-between" style={{ marginBottom: 8 }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 28 }}>👨‍🌾</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{q.farmer}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{q.time}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="badge badge-primary">{q.topic}</span>
                  {q.urgent && <span className="badge badge-red">🔴 Urgent</span>}
                </div>
              </div>
              <p className="hindi" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 12 }}>"{q.question}"</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className={`btn btn-primary btn-sm ${answered.includes(q.id) ? '' : ''}`}
                  disabled={answered.includes(q.id)}
                  onClick={() => setAnswered(a => [...a, q.id])}
                >
                  {answered.includes(q.id) ? '✓ Answered' : '💬 Answer Karo'}
                </button>
                <button className="btn btn-secondary btn-sm">📅 Session Book Karo</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'earnings' && (
        <div className="grid-2">
          <div className="card anim-fadeup delay-1">
            <div className="section-header"><div className="section-title">💰 Earnings Breakdown</div></div>
            {[
              ['Total Earned', `₹${EARNINGS.total.toLocaleString()}`, '#16A34A'],
              ['Platform 20% cut', `- ₹${EARNINGS.platformCut.toLocaleString()}`, '#DC2626'],
              ['Withdrawn', `₹${EARNINGS.withdrawn.toLocaleString()}`, '#2563EB'],
              ['Pending Payout', `₹${EARNINGS.pending.toLocaleString()}`, '#D97706'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 700, color, fontSize: 'var(--text-md)' }}>{val}</span>
              </div>
            ))}
            <button className="btn btn-primary btn-full" style={{ marginTop: 16 }}>🏦 Withdraw ₹{EARNINGS.pending.toLocaleString()}</button>
          </div>
          <div className="card anim-fadeup delay-2">
            <div className="section-header"><div className="section-title">📊 This Month</div></div>
            <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, color: 'var(--primary)', marginBottom: 8 }}>
              ₹{EARNINGS.thisMonth.toLocaleString()}
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 16 }}>
              <span>📅 8 Sessions</span>
              <span>🎁 3 Free demos</span>
            </div>
            <div className="alert-item alert-success">
              📈 Pichle mahine se 23% zyada kamaai. Keep it up!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
