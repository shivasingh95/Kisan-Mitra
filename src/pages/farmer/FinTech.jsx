import React, { useState } from 'react';
import './pages.css';

const SCHEMES = [
  {
    id: 1, name: 'PM-KISAN', nameHi: 'पीएम किसान',
    icon: '🏛️', amount: '₹6,000/year', status: 'eligible',
    desc: 'Direct income support of ₹6000/year in 3 installments to small/marginal farmers.',
    lastBenefit: '14th instalment — ₹2000 credited on April 28',
    nextDate: 'August 2025',
    steps: ['Aadhaar link karo', 'Bank account verify karo', 'e-KYC karein'],
  },
  {
    id: 2, name: 'Kisan Credit Card', nameHi: 'किसान क्रेडिट कार्ड',
    icon: '💳', amount: 'Up to ₹3 Lakh', status: 'applied',
    desc: 'Short-term credit for crop production, post-harvest expenses and allied activities at 4% interest.',
    lastBenefit: 'Application under review — submitted May 2',
    nextDate: 'Decision by May 20',
    steps: ['Documentary apply submitted', 'Bank verification pending', 'Card dispatch'],
  },
  {
    id: 3, name: 'PMFBY Crop Insurance', nameHi: 'फ़सल बीमा',
    icon: '🛡️', amount: 'Up to ₹2 Lakh', status: 'eligible',
    desc: 'Pradhan Mantri Fasal Bima Yojana — financial support in case of crop failure due to natural calamities.',
    lastBenefit: null,
    nextDate: 'Registration: June 30 (Kharif)',
    steps: ['Land record upload karo', 'Premium bharo', 'Policy confirmation lo'],
  },
  {
    id: 4, name: 'Soil Health Card', nameHi: 'मृदा स्वास्थ्य कार्ड',
    icon: '🌍', amount: 'Free Service', status: 'received',
    desc: 'Government issues soil health card with nutrient status and crop-wise fertilizer recommendations.',
    lastBenefit: 'Card received — March 2025',
    nextDate: 'Next test: March 2027',
    steps: null,
  },
];

const INCOME = [
  { month: 'Jan', income: 12000, expense: 4500 },
  { month: 'Feb', income: 8000, expense: 3200 },
  { month: 'Mar', income: 22000, expense: 7800 },
  { month: 'Apr', income: 5000, expense: 2400 },
  { month: 'May', income: 18000, expense: 6100 },
];

const STATUS_CONFIG = {
  eligible: { label: 'Eligible', color: '#16A34A', bg: '#DCFCE7' },
  applied:  { label: 'Applied',  color: '#D97706', bg: '#FEF9C3' },
  received: { label: 'Received', color: '#2563EB', bg: '#DBEAFE' },
};

export default function FinTech() {
  const [applying, setApplying] = useState(null);
  const [applied, setApplied] = useState([]);

  const apply = (id) => {
    setTimeout(() => { setApplied(a => [...a, id]); setApplying(null); }, 1500);
    setApplying(id);
  };

  const maxIncome = Math.max(...INCOME.map(i => i.income));

  return (
    <div className="anim-page">
      <div className="dashboard-greeting">
        <div>
          <h1 className="page-title">💳 Loans & Schemes</h1>
          <p className="page-sub hindi">Sarkari yojanaen, KCC loan aur income bookkeeping — sab ek jagah</p>
        </div>
      </div>

      {/* Credit Score Card */}
      <div className="card anim-fadeup delay-1" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-700) 100%)', color: '#fff' }}>
        <div className="flex justify-between items-center">
          <div>
            <div style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginBottom: 4 }}>Kisan Credit Score</div>
            <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 900, letterSpacing: -2 }}>742</div>
            <div style={{ fontSize: 'var(--text-sm)', opacity: 0.85, marginTop: 4 }}>
              ✅ Good — Aap KCC loan ke liye eligible hain
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 48 }}>🏆</div>
            <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7, marginTop: 4 }}>Top 22% farmers mein</div>
          </div>
        </div>
        <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 12, overflow: 'hidden', height: 8 }}>
          <div style={{ width: '74.2%', height: '100%', background: '#74C69D', borderRadius: 12 }} />
        </div>
        <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.7 }}>
          <span>300</span><span>550 Fair</span><span>700 Good</span><span>900</span>
        </div>
      </div>

      {/* Schemes */}
      <div className="section-header">
        <div className="section-title">🏛️ Aapki Eligible Yojanaen</div>
      </div>
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {SCHEMES.map((s, i) => {
          const cfg = STATUS_CONFIG[s.status];
          const isApplied = applied.includes(s.id);
          return (
            <div key={s.id} className={`card card-3d anim-fadeup delay-${i % 4 + 1}`}>
              <div className="flex justify-between" style={{ marginBottom: 10 }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 32 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--text-md)' }}>{s.name}</div>
                    <div className="hindi" style={{ fontSize: 12, color: 'var(--text-light)' }}>{s.nameHi}</div>
                  </div>
                </div>
                <span style={{ background: cfg.bg, color: cfg.color, padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>
                  {cfg.label}
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: 10 }}>{s.desc}</p>
              <div style={{ background: 'var(--primary-ghost)', padding: '10px 14px', borderRadius: 10, marginBottom: 12, fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 'var(--text-md)' }}>{s.amount}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                  {s.lastBenefit && <span>✅ {s.lastBenefit}<br /></span>}
                  📅 {s.nextDate}
                </div>
              </div>
              {s.status !== 'received' && (
                <button
                  className={`btn btn-full ${isApplied || s.status === 'applied' ? 'btn-ghost' : 'btn-primary'}`}
                  disabled={isApplied || s.status === 'applied' || applying === s.id}
                  onClick={() => apply(s.id)}
                >
                  {applying === s.id ? '⏳ Apply ho raha hai…'
                    : isApplied ? '✓ Apply Ho Gaya!'
                    : s.status === 'applied' ? '⏳ Under Review'
                    : '📋 Apply Karo'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Income Chart */}
      <div className="card anim-fadeup delay-5">
        <div className="section-header">
          <div className="section-title">📊 Income vs Expense</div>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Last 5 months</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 140, padding: '0 8px' }}>
          {INCOME.map(row => (
            <div key={row.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 120 }}>
                <div style={{ width: 14, height: `${(row.income / maxIncome) * 100}%`, background: 'var(--green-600)', borderRadius: '3px 3px 0 0', transition: 'height 1s var(--ease-spring)' }} title={`Income: ₹${row.income}`} />
                <div style={{ width: 14, height: `${(row.expense / maxIncome) * 100}%`, background: 'var(--green-300)', borderRadius: '3px 3px 0 0', transition: 'height 1s var(--ease-spring)' }} title={`Expense: ₹${row.expense}`} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>{row.month}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--green-600)', borderRadius: 2, marginRight: 4 }} />Income</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--green-300)', borderRadius: 2, marginRight: 4 }} />Expense</span>
          <span style={{ marginLeft: 'auto' }}>Total this month: <b style={{ color: 'var(--text-900)' }}>₹18,000</b></span>
        </div>
      </div>
    </div>
  );
}
