import React, { useState } from 'react';
import './pages.css';
import { useTranslation } from '@/i18n/useTranslation';
import { trackExpertBooking } from '@/shared/utils/analytics';
import { formatINR } from '@/shared/utils/formatters';

const EXPERTS = [
  {
    id: 1, name: 'Dr. Arvind Sharma', nameHi: 'डॉ. अरविंद शर्मा',
    title: 'Plant Pathologist', titleHi: 'वरिष्ठ पादप रोग विशेषज्ञ',
    exp: 18, rating: 4.9, sessions: 1240,
    specs: ['Wheat', 'Rice', 'Pest Control'],
    specsHi: ['गेहूं', 'धान', 'कीट नियंत्रण'],
    lang: ['Hindi', 'English'],
    freeSlots: 3, rate: 299,
    avatar: '👨‍🔬', verified: true,
    bio: 'Senior plant pathologist from IARI Delhi. Specializes in cereal crop diseases. Has advised 50,000+ farmers.',
    bioHi: 'आईएआरआई दिल्ली के वरिष्ठ कृषि वैज्ञानिक। अनाज फसलों के रोगों के विशेषज्ञ। 50,000 से अधिक किसानों को परामर्श दे चुके हैं।',
  },
  {
    id: 2, name: 'Sunita Patel', nameHi: 'सुनीता पटेल',
    title: 'Organic Farming Expert', titleHi: 'जैविक व प्राकृतिक खेती विशेषज्ञ',
    exp: 12, rating: 4.8, sessions: 876,
    specs: ['Organic', 'Vegetables', 'Soil Health'],
    specsHi: ['जैविक खेती', 'सब्जी उत्पादन', 'मृदा स्वास्थ्य'],
    lang: ['Hindi', 'Gujarati'],
    freeSlots: 5, rate: 199,
    avatar: '👩‍🌾', verified: true,
    bio: 'Certified organic farming consultant. Helped 200+ farms transition to chemical-free cultivation.',
    bioHi: 'प्रमाणित जैविक कृषि सलाहकार। 200+ खेतों को रासायनिक मुक्त खेती में बदलने में मदद की।',
  },
  {
    id: 3, name: 'Rajesh Menon', nameHi: 'राजेश मेनन',
    title: 'Agri Finance Specialist', titleHi: 'कृषि ऋण एवं वित्त विशेषज्ञ',
    exp: 9, rating: 4.7, sessions: 534,
    specs: ['KCC Loan', 'PM Kisan', 'Insurance'],
    specsHi: ['KCC ऋण', 'पीएम किसान', 'फसल बीमा'],
    lang: ['Hindi', 'Malayalam', 'English'],
    freeSlots: 2, rate: 149,
    avatar: '👨‍💼', verified: true,
    bio: 'Former agriculture bank officer. Expert in government schemes, KCC loans and crop insurance claims.',
    bioHi: 'पूर्व कृषि बैंक अधिकारी। सरकारी योजनाओं, केसीसी ऋण और फसल बीमा दावों के विशेषज्ञ।',
  },
  {
    id: 4, name: 'Priya Singh', nameHi: 'प्रिया सिंह',
    title: 'Horticulture Expert', titleHi: 'बागवानी एवं पॉलीहाउस विशेषज्ञ',
    exp: 7, rating: 4.6, sessions: 328,
    specs: ['Fruits', 'Vegetables', 'Poly House'],
    specsHi: ['फल उत्पादन', 'सब्जियां', 'पॉलीहाउस'],
    lang: ['Hindi', 'English'],
    freeSlots: 4, rate: 249,
    avatar: '👩‍💼', verified: false,
    bio: 'Horticulture specialist with hands-on experience in polyhouse farming, drip irrigation & protected cultivation.',
    bioHi: 'पॉलीहाउस खेती, ड्रिप सिंचाई और संरक्षित खेती के व्यावहारिक अनुभव के साथ बागवानी विशेषज्ञ।',
  },
];

const SLOTS = ['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '3:30 PM', '5:00 PM'];

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= Math.round(rating) ? '#F59E0B' : '#E5E7EB', fontSize: 13 }}>★</span>
      ))}
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginLeft: 3 }}>{rating}</span>
    </div>
  );
}

export default function ExpertConnect() {
  const { t, isHindi } = useTranslation();
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [bookedSlot, setBookedSlot] = useState(null);
  const [bookingDone, setBookingDone] = useState(false);

  const categories = ['All', 'Wheat', 'Rice', 'Organic', 'Finance', 'Horticulture'];
  const categoriesHi = {
    All: 'सभी',
    Wheat: 'गेहूं',
    Rice: 'धान',
    Organic: 'जैविक',
    Finance: 'ऋण व बीमा',
    Horticulture: 'बागवानी',
  };

  const filtered = filter === 'All' 
    ? EXPERTS 
    : EXPERTS.filter(e => e.specs.some(s => s.toLowerCase().includes(filter.toLowerCase())));

  const bookSlot = (slot) => {
    setBookedSlot(slot);
    trackExpertBooking(selected.id, selected.title);
    setTimeout(() => { setBookingDone(true); }, 500);
  };

  return (
    <div className="anim-page">
      <div className="dashboard-greeting">
        <div>
          <h1 className="page-title">👨‍💼 {t('expert.title')}</h1>
          <p className="page-sub hindi">
            {isHindi 
              ? 'कृषि वैज्ञानिकों और विशेषज्ञों से सीधी सलाह — मुफ़्त डेमो परामर्श उपलब्ध' 
              : 'Direct consultation with agricultural scientists — Free demo always available'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { icon: '👨‍🏫', label: 'Verified Experts', labelHi: 'सत्यापित विशेषज्ञ', value: '2,400+', color: '#52B788' },
          { icon: '✅', label: 'Free Demo Slots',   labelHi: 'मुफ़्त डेमो स्लॉट', value: isHindi ? 'उपलब्ध' : 'Available', color: '#3B82F6' },
          { icon: '⭐', label: 'Avg Rating',        labelHi: 'औसत रेटिंग',       value: '4.8 / 5', color: '#F59E0B' },
          { icon: '🌐', label: 'Languages',         labelHi: 'भाषाएं',           value: isHindi ? '14 भाषाएं' : '14 Languages', color: '#8B5CF6' },
        ].map((s, i) => (
          <div key={i} className={`card stat-card anim-fadeup delay-${i + 1}`}>
            <div className="stat-icon-wrap" style={{ background: `${s.color}1A`, color: s.color }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <div className="stat-body">
              <span className="stat-label">{isHindi ? s.labelHi : s.label}</span>
              <div className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Pills */}
      <div className="pill-group" style={{ marginBottom: 20 }}>
        {categories.map(c => (
          <button key={c} className={`pill ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {isHindi ? (categoriesHi[c] || c) : c}
          </button>
        ))}
      </div>

      {/* Expert Cards */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {filtered.map((e, i) => (
          <div 
            key={e.id} 
            className={`card card-3d expert-card anim-fadeup delay-${i % 4 + 1}`}
            onClick={() => setSelected(e)} 
            style={{ cursor: 'pointer' }}
          >
            <div className="flex gap-4">
              <div style={{ fontSize: 52, lineHeight: 1, flexShrink: 0, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>
                {e.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 'var(--text-md)' }}>
                    {isHindi ? e.nameHi : e.name}
                  </h3>
                  {e.verified && <span className="badge badge-green">✓ {isHindi ? 'सत्यापित' : 'Verified'}</span>}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 4 }}>
                  {isHindi ? e.titleHi : e.title}
                </div>
                <StarRating rating={e.rating} />
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(isHindi && e.specsHi ? e.specsHi : e.specs).map(s => (
                <span key={s} className="badge badge-primary">{s}</span>
              ))}
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 'var(--text-sm)', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span>🎓 {e.exp} {isHindi ? 'वर्ष का अनुभव' : 'yrs exp'}</span>
              <span>💬 {e.sessions.toLocaleString()} {isHindi ? 'परामर्श सत्र' : 'sessions'}</span>
              <span>🗣 {e.lang.join(', ')}</span>
            </div>

            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <span className="badge badge-green" style={{ marginRight: 6 }}>
                  🎁 {isHindi ? `मुफ़्त डेमो (${e.freeSlots} स्लॉट)` : `Free demo (${e.freeSlots} slots)`}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  {isHindi ? `शुल्क: ${formatINR(e.rate)}/सत्र` : `Paid: ${formatINR(e.rate)}/session`}
                </span>
              </div>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={ev => { ev.stopPropagation(); setSelected(e); }}
              >
                {isHindi ? 'डेमो बुक करें' : 'Book Demo'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Expert Detail / Booking Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => { setSelected(null); setBookedSlot(null); setBookingDone(false); }}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            {!bookingDone ? (
              <>
                <div className="modal-header">
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 44 }}>{selected.avatar}</span>
                    <div>
                      <h3 className="modal-title">{isHindi ? selected.nameHi : selected.name}</h3>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                        {isHindi ? selected.titleHi : selected.title}
                      </div>
                      <StarRating rating={selected.rating} />
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
                </div>

                <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 20 }}>
                  {isHindi ? selected.bioHi : selected.bio}
                </p>

                <div className="alert-item alert-success" style={{ marginBottom: 20 }}>
                  🎁 <strong>{isHindi ? 'मुफ़्त 15-मिनट डेमो' : 'Free Demo'}</strong> — {isHindi ? `आज ${selected.freeSlots} मुफ़्त स्लॉट उपलब्ध हैं। कोई शुल्क नहीं!` : `${selected.freeSlots} free demo slots available today.`}
                </div>

                <h4 style={{ fontWeight: 700, marginBottom: 12 }}>
                  {isHindi ? 'उपलब्ध समय स्लॉट (आज)' : 'Available Slots (Today)'}
                </h4>
                <div className="slot-grid">
                  {SLOTS.map(s => (
                    <button
                      key={s}
                      className={`slot-btn ${bookedSlot === s ? 'selected' : ''}`}
                      onClick={() => setBookedSlot(s)}
                    >
                      🕐 {s}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                  <button
                    className="btn btn-primary btn-full"
                    disabled={!bookedSlot}
                    onClick={() => bookSlot(bookedSlot)}
                  >
                    {bookedSlot 
                      ? (isHindi ? `📅 ${bookedSlot} पर बुक करें (मुफ़्त)` : `📅 Book for ${bookedSlot} (Free)`) 
                      : (isHindi ? 'कृपया समय चुनें' : 'Select a slot')}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 8 }}>
                  {isHindi ? 'बुकिंग सफलतापूर्वक स्वीकृत!' : 'Booking Confirmed!'}
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <strong>{isHindi ? selected.nameHi : selected.name}</strong> {isHindi ? `के साथ ${bookedSlot} पर परामर्श स्लॉट बुक हो गया है।` : `consultation scheduled at ${bookedSlot}.`}<br />
                  {isHindi ? 'SMS और ऐप नोटिफिकेशन के माध्यम से लिंक भेजा जाएगा।' : 'Meeting link sent via SMS and notification.'}
                </p>
                <div className="badge badge-green" style={{ margin: '16px auto', fontSize: 14, padding: '8px 20px' }}>
                  {isHindi ? `आज ${bookedSlot} पर जुड़ें` : `Join at ${bookedSlot}`}
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ marginTop: 12 }} 
                  onClick={() => { setSelected(null); setBookingDone(false); setBookedSlot(null); }}
                >
                  {isHindi ? 'संपन्न' : 'Done'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
