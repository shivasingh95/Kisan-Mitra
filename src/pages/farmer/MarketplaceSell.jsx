import React, { useState, useEffect } from 'react';
import './pages.css';
import { getMyListings, addListing } from '@/services/firebase/firestore.service';
import { getMandiPrices, DEFAULT_MANDI_PRICES } from '@/services/api/agmarknet.service';
import { trackListingCreated, trackMandiPriceView } from '@/shared/utils/analytics';
import { formatINR } from '@/shared/utils/formatters';
import { useTranslation } from '@/i18n/useTranslation';
import { useApp } from '@/context/AppContext';

const INITIAL_MY_LISTINGS = [
  { id: 1, crop: 'Wheat 🌾', qty: '20 quintal', price: 2150, status: 'active', buyer: null, date: '10 May' },
  { id: 2, crop: 'Tomato 🍅', qty: '5 quintal', price: 44, status: 'pending', buyer: 'Ravi Traders', date: '9 May' },
];

// Simple sparkline SVG
function Sparkline({ data = [2000, 2050, 2100], color = '#16A34A' }) {
  const W = 80, H = 30;
  const min = Math.min(...data), max = Math.max(...data);
  const xStep = W / Math.max(data.length - 1, 1);
  const y = v => H - ((v - min) / (max - min || 1)) * H;
  const points = data.map((v, i) => `${i * xStep},${y(v)}`).join(' ');
  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }} aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) * xStep} cy={y(data[data.length - 1])} r="3" fill={color} />
    </svg>
  );
}

export default function MarketplaceSell() {
  const { firebaseUser, showToast } = useApp();
  const { t, isHindi } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ crop: '', qty: '', unit: 'quintal', price: '', location: '' });
  const [listings, setListings] = useState(INITIAL_MY_LISTINGS);
  const [mandiPrices, setMandiPrices] = useState(DEFAULT_MANDI_PRICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Fetch live Mandi rates
    getMandiPrices()
      .then(prices => {
        if (mounted && prices?.length) {
          setMandiPrices(prices);
          trackMandiPriceView('All MP Mandis');
        }
      })
      .catch(err => console.warn('Mandi price load fallback:', err));

    // Fetch user listings
    const fetchListings = async () => {
      if (!firebaseUser?.uid || firebaseUser.uid === 'demo') {
        setLoading(false);
        return;
      }
      try {
        const data = await getMyListings(firebaseUser.uid);
        if (mounted) {
          if (data && data.length > 0) setListings(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch user listings', err);
        if (mounted) setLoading(false);
      }
    };
    fetchListings();
    return () => { mounted = false; };
  }, [firebaseUser]);

  const handleAddListing = async () => {
    if (!form.crop || !form.qty || !form.price) return;
    
    const newListing = {
      crop: form.crop,
      qty: form.qty,
      unit: form.unit,
      price: +form.price,
      location: form.location,
      farmer: firebaseUser?.displayName || 'Farmer',
      photo: '🌾'
    };

    try {
      if (firebaseUser?.uid && firebaseUser.uid !== 'demo') {
        const refId = await addListing(firebaseUser.uid, newListing);
        setListings(prev => [{ id: refId, ...newListing, status: 'active', date: 'Today' }, ...prev]);
        showToast(isHindi ? 'लिस्टिंग सफलतापूर्वक जोड़ी गई!' : 'Listing added successfully!');
      } else {
        // Fallback for demo mode
        setListings(prev => [{ id: Date.now(), ...newListing, status: 'active', date: 'Today' }, ...prev]);
        showToast(isHindi ? 'डेमो लिस्टिंग जोड़ी गई!' : 'Demo listing added!');
      }
      trackListingCreated(form.crop, +form.price);
      setForm({ crop: '', qty: '', unit: 'quintal', price: '', location: '' });
      setShowAdd(false);
    } catch (err) {
      console.error('Failed to add listing', err);
      showToast(isHindi ? 'लिस्टिंग जोड़ने में विफल' : 'Failed to add listing', 'error');
    }
  };

  return (
    <div className="anim-page">
      <div className="dashboard-greeting">
        <div>
          <h1 className="page-title">🛒 {t('marketplace.title')}</h1>
          <p className="page-sub hindi">
            {isHindi ? 'अपनी फसल बेचें · लाइव मंडी भाव देखें' : 'Sell your harvest · Check live Mandi rates'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + {t('marketplace.addListing')}
        </button>
      </div>

      {/* Price Table */}
      <div className="card anim-fadeup delay-1" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <div className="section-title">
            📊 {t('marketplace.mandiPrices')} <span className="badge badge-live ml-2"><span className="live-dot" /> Live</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
            {isHindi ? 'स्रोत: Agmarknet' : 'Source: Agmarknet'}
          </span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Current Price</th>
                <th>MSP</th>
                <th>Change</th>
                <th>Trend</th>
                <th>Mandi</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mandiPrices.map(m => (
                <tr key={m.id || m.crop}>
                  <td>
                    <span style={{ fontSize: 18, marginRight: 6 }}>{m.emoji}</span>
                    <b>{isHindi && m.cropHi ? m.cropHi : m.crop}</b>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: 'var(--text-md)' }}>
                    ₹{m.current}
                    <span style={{ fontSize: 11, color: 'var(--text-light)' }}>/qtl</span>
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    {m.msp ? `₹${m.msp}` : '—'}
                  </td>
                  <td>
                    <span className={`badge ${m.trend === 'up' ? 'badge-green' : 'badge-red'}`}>
                      {m.trend === 'up' ? '↑' : '↓'} ₹{Math.abs(m.change)}
                    </span>
                  </td>
                  <td>
                    <Sparkline data={m.hist || [m.current - 50, m.current]} color={m.trend === 'up' ? '#16A34A' : '#DC2626'} />
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{m.loc}</td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={() => {
                        setForm(f => ({ ...f, crop: isHindi && m.cropHi ? m.cropHi : m.crop, price: m.current }));
                        setShowAdd(true);
                      }}
                    >
                      {t('marketplace.sell')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Listings */}
      <div className="card anim-fadeup delay-2">
        <div className="section-header">
          <div className="section-title">📦 {isHindi ? 'मेरी लिस्टिंग्स' : 'My Listings'}</div>
          <span className="badge badge-primary">{listings.length} active</span>
        </div>
        {listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <p className="hindi">{t('marketplace.noListings')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {listings.map(l => (
              <div key={l.id} className="card card-flat listing-card">
                <div className="flex justify-between items-center">
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-md)' }}>{l.crop}</span>
                  <span className={`badge ${l.status === 'active' ? 'badge-green' : l.status === 'pending' ? 'badge-amber' : 'badge-gray'}`}>
                    {l.status === 'active' ? '✓ Active' : l.status === 'pending' ? '⏳ Buyer Interested' : 'Completed'}
                  </span>
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  <span>📦 {l.qty}</span>
                  <span>💰 {formatINR(l.price)}</span>
                  <span>📅 {l.date}</span>
                </div>
                {l.buyer && (
                  <div className="alert-item alert-success" style={{ marginTop: 10 }}>
                    🏪 {l.buyer} {isHindi ? 'खरीदना चाहता है — स्वीकार करें?' : 'wants to buy — Accept?'}
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      {isHindi ? 'स्वीकार करें' : 'Accept'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Listing Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title hindi">📦 {t('marketplace.addListing')}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAdd(false)} aria-label="Close">✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">{isHindi ? 'फसल का नाम' : 'Crop Name'}</label>
                <input 
                  className="form-input" 
                  placeholder={isHindi ? 'उदा. गेहूं, टमाटर' : 'e.g. Wheat, Tomato'} 
                  value={form.crop} 
                  onChange={e => setForm(f => ({ ...f, crop: e.target.value }))} 
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">{t('marketplace.quantity')}</label>
                  <input 
                    className="form-input" 
                    type="number" 
                    placeholder="Amount" 
                    value={form.qty} 
                    onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select 
                    className="form-input form-select" 
                    value={form.unit} 
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  >
                    <option value="quintal">quintal</option>
                    <option value="kg">kg</option>
                    <option value="ton">ton</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {t('marketplace.price')} (₹ per {form.unit})
                </label>
                <input 
                  className="form-input" 
                  type="number" 
                  placeholder="Price" 
                  value={form.price} 
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isHindi ? 'गाँव / मंडी' : 'Village / Mandi'}</label>
                <input 
                  className="form-input" 
                  placeholder={isHindi ? 'उदा. सीहोर' : 'e.g. Sehore'} 
                  value={form.location} 
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))} 
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-primary btn-full" onClick={handleAddListing}>
                  ✓ {t('marketplace.addListing')}
                </button>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
