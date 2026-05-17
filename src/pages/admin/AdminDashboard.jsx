import React, { useState } from 'react';
import './pages.css';

const USERS = [
  { type:'farmer',active:24180, today:142, growth:'+8%' },
  { type:'expert',active:2418,  today:18,  growth:'+12%' },
  { type:'buyer', active:5840,  today:36,  growth:'+5%' },
];

const RECENT = [
  { id:1, action:'New expert verification request', user:'Dr. Seema Gupta', time:'5 min ago', type:'review' },
  { id:2, action:'Flagged listing: suspicious price', user:'Raju Patel', time:'18 min ago', type:'flag' },
  { id:3, action:'Farmer onboarded — Rajasthan', user:'Ashok Choudhary', time:'45 min ago', type:'success' },
  { id:4, action:'Session dispute reported', user:'Buyer #3842', time:'1h ago', type:'flag' },
];

const REVENUE = { total:1245000, thisMonth:184000, platformFee:62400, pending:28000 };

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="anim-page">
      <div className="dashboard-greeting">
        <div>
          <h1 className="page-title">⚙️ Admin Panel</h1>
          <p className="page-sub">Platform monitoring · Internal use only</p>
        </div>
        <span className="badge badge-red" style={{ padding:'8px 16px', fontSize:14 }}>🔒 Admin Only</span>
      </div>

      {/* Big Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { icon:'👨‍🌾', label:'Total Farmers',   value:'24,180', change:'+142 today', color:'#52B788' },
          { icon:'👨‍🏫', label:'Verified Experts', value:'2,418',  change:'+18 today',  color:'#3B82F6' },
          { icon:'🏪',  label:'Active Buyers',   value:'5,840',  change:'+36 today',  color:'#F59E0B' },
          { icon:'💰',  label:'Monthly Revenue', value:'₹1.84L', change:'+12.3% MoM',  color:'#8B5CF6' },
        ].map((s,i) => (
          <div key={i} className={`card stat-card anim-fadeup delay-${i+1}`}>
            <div className="stat-icon-wrap" style={{ background:`${s.color}1A`, color:s.color }}>
              <span style={{ fontSize:22 }}>{s.icon}</span>
            </div>
            <div className="stat-body">
              <span className="stat-label">{s.label}</span>
              <div className="stat-value">{s.value}</div>
              <span className="stat-change up">↑ {s.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pill-group" style={{ marginBottom: 20 }}>
        {['overview','verifications','flags','revenue'].map(t => (
          <button key={t} className={`pill ${tab===t?'active':''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid-2">
          <div className="card anim-fadeup delay-1">
            <div className="section-header"><div className="section-title">⚡ Recent Activity</div></div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {RECENT.map(r => (
                <div key={r.id} style={{ display:'flex', gap:12, padding:'10px', background:'var(--bg-main)', borderRadius:10 }}>
                  <span style={{ fontSize:20 }}>{r.type==='review'?'🔍':r.type==='flag'?'🚩':'✅'}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'var(--text-sm)', fontWeight:600 }}>{r.action}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{r.user} · {r.time}</div>
                  </div>
                  {r.type === 'review' && <button className="btn btn-primary btn-sm">Review</button>}
                  {r.type === 'flag'   && <button className="btn btn-danger btn-sm">Resolve</button>}
                </div>
              ))}
            </div>
          </div>

          <div className="card anim-fadeup delay-2">
            <div className="section-header"><div className="section-title">💰 Revenue Breakdown</div></div>
            {[
              ['Total Revenue',    `₹${(REVENUE.total/1000).toFixed(0)}K`,    '#16A34A'],
              ['This Month',       `₹${(REVENUE.thisMonth/1000).toFixed(0)}K`, '#2563EB'],
              ['Platform Fee',     `₹${(REVENUE.platformFee/1000).toFixed(0)}K`,'#8B5CF6'],
              ['Pending Payouts',  `₹${(REVENUE.pending/1000).toFixed(0)}K`,  '#D97706'],
            ].map(([label,val,col]) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border-light)' }}>
                <span style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight:700, color:col }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'verifications' && (
        <div className="card anim-fadeup delay-1">
          <div className="section-header"><div className="section-title">🔍 Pending Expert Verifications</div></div>
          {[
            { name:'Dr. Seema Gupta', spec:'Horticulture', doc:'PhD Certificate uploaded', time:'2h ago' },
            { name:'Vikram Joshi',    spec:'Agri Finance',  doc:'Bank officer certificate', time:'5h ago' },
          ].map((v,i) => (
            <div key={i} style={{ display:'flex', gap:14, alignItems:'center', padding:'14px 0', borderBottom:'1px solid var(--border-light)' }}>
              <span style={{ fontSize:36 }}>👨‍🏫</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700 }}>{v.name}</div>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>{v.spec} · {v.doc}</div>
                <div style={{ fontSize:12, color:'var(--text-light)' }}>{v.time}</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-primary btn-sm">✓ Approve</button>
                <button className="btn btn-danger btn-sm">✕ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'flags' && (
        <div className="card anim-fadeup delay-1">
          <div className="section-header"><div className="section-title">🚩 Flagged Content</div></div>
          <div className="alert-item alert-warning" style={{ marginBottom:16 }}>
            ⚠️ 2 listings flagged for suspicious pricing. Please review.
          </div>
          {[
            { type:'Listing', item:'Wheat @ ₹800/qtl — 60% below mandi', flag:'Abnormal price' },
            { type:'Session', item:'Expert charged without demo — Buyer complaint', flag:'Dispute' },
          ].map((f,i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'12px', background:'#FFF1F1', borderRadius:10, marginBottom:10, border:'1px solid #FCA5A5' }}>
              <span style={{ fontSize:24 }}>🚩</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:'#991B1B' }}>{f.type} — {f.flag}</div>
                <div style={{ fontSize:13, color:'#991B1B', opacity:0.8 }}>{f.item}</div>
              </div>
              <button className="btn btn-danger btn-sm">Resolve</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'revenue' && (
        <div className="card anim-fadeup delay-1">
          <div className="section-header"><div className="section-title">📊 Revenue by Category</div></div>
          {[
            { cat:'Marketplace Fees (2-5%)', amount:84200, pct:68 },
            { cat:'Expert Sessions (20%)',   amount:28600, pct:23 },
            { cat:'Subscription Plans',      amount:11400, pct:9 },
          ].map(r => (
            <div key={r.cat} style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'var(--text-sm)' }}>
                <span>{r.cat}</span>
                <span style={{ fontWeight:700 }}>₹{r.amount.toLocaleString()} ({r.pct}%)</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width:`${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
