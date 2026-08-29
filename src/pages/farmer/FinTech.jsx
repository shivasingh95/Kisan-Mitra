import React, { useState } from 'react';
import './pages.css';
import { useTranslation } from '@/i18n/useTranslation';
import { formatINR } from '@/shared/utils/formatters';
import { trackFeatureClick } from '@/shared/utils/analytics';

const SCHEMES = [
  {
    id: 1, name: 'PM-KISAN', nameHi: 'पीएम किसान सम्मान निधि',
    icon: '🏛️', amount: '₹6,000/year', amountHi: '₹6,000 / प्रति वर्ष', status: 'eligible',
    desc: 'Direct income support of ₹6000/year in 3 installments to small/marginal farmers.',
    descHi: 'छोटे व सीमांत किसानों को प्रति वर्ष ₹6000 की प्रत्यक्ष आय सहायता 3 समान किस्तों में।',
    lastBenefit: '14th instalment — ₹2000 credited on April 28',
    lastBenefitHi: '14वीं किस्त — ₹2000 खाते में 28 अप्रैल को जमा',
    nextDate: 'August 2025',
    nextDateHi: 'अगस्त 2025',
  },
  {
    id: 2, name: 'Kisan Credit Card (KCC)', nameHi: 'किसान क्रेडिट कार्ड',
    icon: '💳', amount: 'Up to ₹3 Lakh', amountHi: '₹3 लाख तक ऋण', status: 'applied',
    desc: 'Short-term credit for crop production, post-harvest expenses and allied activities at 4% interest.',
    descHi: 'फसल उत्पादन, कटाई के बाद के खर्चों के लिए 4% रियायती ब्याज दर पर आसान अल्पकालिक ऋण।',
    lastBenefit: 'Application under review — submitted May 2',
    lastBenefitHi: 'आवेदन बैंक समीक्षाधीन — 2 मई को जमा',
    nextDate: 'Decision by May 20',
    nextDateHi: '20 मई तक स्वीकृति',
  },
  {
    id: 3, name: 'PMFBY Crop Insurance', nameHi: 'प्रधानमंत्री फ़सल बीमा योजना',
    icon: '🛡️', amount: 'Up to ₹2 Lakh', amountHi: '₹2 लाख तक सुरक्षा', status: 'eligible',
    desc: 'Financial protection and yield compensation in case of crop failure due to natural calamities.',
    descHi: 'प्राकृतिक आपदाओं, सूखा या कीट प्रकोप से फसल क्षति की स्थिति में वित्तीय सुरक्षा व मुआवजा।',
    lastBenefit: null,
    lastBenefitHi: null,
    nextDate: 'Registration: June 30 (Kharif)',
    nextDateHi: 'पंजीकरण: 30 जून (खरीफ)',
  },
  {
    id: 4, name: 'Soil Health Card', nameHi: 'मृदा स्वास्थ्य कार्ड योजना',
    icon: '🌍', amount: 'Free Service', amountHi: 'निःशुल्क सेवा', status: 'received',
    desc: 'Government issues soil health card with nutrient status and crop-wise fertilizer recommendations.',
    descHi: 'मिट्टी की उर्वरता जांच रिपोर्ट और फसलवार उर्वरक सिफारिशों के साथ मुफ्त कार्ड।',
    lastBenefit: 'Card received — March 2025',
    lastBenefitHi: 'कार्ड प्राप्त — मार्च 2025',
    nextDate: 'Next test: March 2027',
    nextDateHi: 'अगला परीक्षण: मार्च 2027',
  },
];

const INCOME = [
  { month: 'Jan', monthHi: 'जनवरी', income: 12000, expense: 4500 },
  { month: 'Feb', monthHi: 'फ़रवरी', income: 8000,  expense: 3200 },
  { month: 'Mar', monthHi: 'मार्च',   income: 22000, expense: 7800 },
  { month: 'Apr', monthHi: 'अप्रैल',   income: 5000,  expense: 2400 },
  { month: 'May', monthHi: 'मई',     income: 18000, expense: 6100 },
];

export default function FinTech() {
  const { t, isHindi } = useTranslation();
  const [applying, setApplying] = useState(null);
  const [applied, setApplied] = useState([]);

  const apply = (id) => {
    trackFeatureClick(`scheme_apply_${id}`);
    setApplying(id);
    setTimeout(() => { 
      setApplied(a => [...a, id]); 
      setApplying(null); 
    }, 1200);
  };

  const maxIncome = Math.max(...INCOME.map(i => i.income));

  return (
    <div className="anim-page">
      <div className="dashboard-greeting">
        <div>
          <h1 className="page-title">💳 {t('fintech.title')}</h1>
          <p className="page-sub hindi">
            {isHindi 
              ? 'सरकारी योजनाएं, KCC ऋण और आय-व्यय हिसाब-किताब — सब एक जगह' 
              : 'Government schemes, KCC loans, and bookkeeping in one place'}
          </p>
        </div>
      </div>

      {/* Credit Score Card */}
      <div className="card anim-fadeup delay-1" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-700) 100%)', color: '#fff' }}>
        <div className="flex justify-between items-center">
          <div>
            <div style={{ fontSize: 'var(--text-sm)', opacity: 0.85, marginBottom: 4 }}>
              {isHindi ? 'किसान क्रेडिट स्कोर (Kisan Credit Score)' : 'Kisan Credit Score'}
            </div>
            <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 900, letterSpacing: -2 }}>742</div>
            <div style={{ fontSize: 'var(--text-sm)', opacity: 0.9, marginTop: 4 }}>
              {isHindi ? '✅ उत्तम — आप KCC ऋण और सरकारी सब्सिडी के पात्र हैं' : '✅ Good — You are eligible for KCC & subsidies'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 48 }}>🏆</div>
            <div style={{ fontSize: 'var(--text-xs)', opacity: 0.75, marginTop: 4 }}>
              {isHindi ? 'शीर्ष 22% किसानों में' : 'Top 22% Farmers'}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.2)', borderRadius: 12, overflow: 'hidden', height: 8 }}>
          <div style={{ width: '74.2%', height: '100%', background: '#74C69D', borderRadius: 12 }} />
        </div>
        <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.8 }}>
          <span>300</span><span>550 {isHindi ? 'सामान्य' : 'Fair'}</span><span>700 {isHindi ? 'उत्तम' : 'Good'}</span><span>900</span>
        </div>
      </div>

      {/* Schemes */}
      <div className="section-header">
        <div className="section-title">
          🏛️ {isHindi ? 'आपकी पात्र सरकारी योजनाएं' : 'Eligible Government Schemes'}
        </div>
      </div>
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {SCHEMES.map((s, i) => {
          const isApplied = applied.includes(s.id);
          const isReceived = s.status === 'received';
          const isUnderReview = s.status === 'applied';

          return (
            <div key={s.id} className={`card card-3d anim-fadeup delay-${i % 4 + 1}`}>
              <div className="flex justify-between" style={{ marginBottom: 10 }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 32 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--text-md)' }}>
                      {isHindi ? s.nameHi : s.name}
                    </div>
                    <div className="hindi" style={{ fontSize: 12, color: 'var(--text-light)' }}>
                      {isHindi ? s.name : s.nameHi}
                    </div>
                  </div>
                </div>
                <span className={`badge ${isReceived ? 'badge-blue' : isUnderReview ? 'badge-amber' : 'badge-green'}`} style={{ alignSelf: 'flex-start' }}>
                  {isReceived ? (isHindi ? 'प्राप्त' : 'Received') : isUnderReview ? (isHindi ? 'प्रक्रियाधीन' : 'Applied') : (isHindi ? 'पात्र' : 'Eligible')}
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: 10 }}>
                {isHindi ? s.descHi : s.desc}
              </p>
              <div style={{ background: 'var(--primary-ghost)', padding: '10px 14px', borderRadius: 10, marginBottom: 12, fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 'var(--text-md)' }}>
                  {isHindi ? s.amountHi : s.amount}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                  {s.lastBenefit && <span>✅ {isHindi ? s.lastBenefitHi : s.lastBenefit}<br /></span>}
                  📅 {isHindi ? s.nextDateHi : s.nextDate}
                </div>
              </div>
              {!isReceived && (
                <button
                  className={`btn btn-full ${isApplied || isUnderReview ? 'btn-ghost' : 'btn-primary'}`}
                  disabled={isApplied || isUnderReview || applying === s.id}
                  onClick={() => apply(s.id)}
                >
                  {applying === s.id 
                    ? (isHindi ? '⏳ आवेदन भेजा जा रहा है…' : '⏳ Submitting…')
                    : isApplied 
                    ? (isHindi ? '✓ आवेदन सफलतापूर्वक जमा!' : '✓ Applied Successfully!')
                    : isUnderReview 
                    ? (isHindi ? '⏳ समीक्षाधीन (Under Review)' : '⏳ Under Review')
                    : (isHindi ? '📋 अभी आवेदन करें' : '📋 Apply Now')}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Income Chart */}
      <div className="card anim-fadeup delay-5">
        <div className="section-header">
          <div className="section-title">📊 {isHindi ? 'आय बनाम व्यय (हिसाब-किताब)' : 'Income vs Expense'}</div>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {isHindi ? 'पिछले 5 माह' : 'Last 5 months'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 140, padding: '0 8px' }}>
          {INCOME.map(row => (
            <div key={row.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 120 }}>
                <div 
                  style={{ width: 16, height: `${(row.income / maxIncome) * 100}%`, background: 'var(--green-600)', borderRadius: '3px 3px 0 0', transition: 'height 1s var(--ease-spring)' }} 
                  title={`${isHindi ? 'आय' : 'Income'}: ₹${row.income}`} 
                />
                <div 
                  style={{ width: 16, height: `${(row.expense / maxIncome) * 100}%`, background: 'var(--green-300)', borderRadius: '3px 3px 0 0', transition: 'height 1s var(--ease-spring)' }} 
                  title={`${isHindi ? 'व्यय' : 'Expense'}: ₹${row.expense}`} 
                />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>
                {isHindi ? row.monthHi : row.month}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--green-600)', borderRadius: 2, marginRight: 6 }} />
            {isHindi ? 'आय (Income)' : 'Income'}
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--green-300)', borderRadius: 2, marginRight: 6 }} />
            {isHindi ? 'व्यय (Expense)' : 'Expense'}
          </span>
          <span style={{ marginLeft: 'auto' }}>
            {isHindi ? 'इस माह कुल आय:' : 'Total this month:'} <b style={{ color: 'var(--text-900)' }}>{formatINR(18000)}</b>
          </span>
        </div>
      </div>
    </div>
  );
}
