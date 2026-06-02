import React, { useState, useEffect } from 'react';
import './pages.css';
import { getMyListings, addListing } from '../../services/db';
import { useApp } from '../../context/AppContext';

const MANDI_PRICES = [
  { crop: 'Wheat',  emoji: '🌾', msp: 2275, current: 2150, trend: 'down', change: -35, loc: 'Bhopal',    hist: [2100,2120,2135,2130,2145,2150] },
  { crop: 'Rice',   emoji: '🍚', msp: 2183, current: 3200, trend: 'up',   change: +80, loc: 'Sehore',    hist: [3050,3100,3120,3160,3180,3200] },
  { crop: 'Maize',  emoji: '🌽', msp: 1962, current: 1850, trend: 'up',   change: +20, loc: 'Indore',    hist: [1800,1810,1820,1830,1840,1850] },
  { crop: 'Tomato', emoji: '🍅', msp: null,  current: 45,   trend: 'up',   change: +12, loc: 'Vidisha',   hist: [28,30,35,38,42,45] },
  { crop: 'Onion',  emoji: '🧅', msp: null,  current: 28,   trend: 'down', change: -5,  loc: 'Ujjain',    hist: [38,35,33,31,29,28] },
  { crop: 'Potato', emoji: '🥔', msp: null,  current: 22,   trend: 'up',   change: +3,  loc: 'Gwalior',   hist: [18,19,20,21,21,22] },
  { crop: 'Soybean',emoji: '🫘', msp: 4892, current: 5100, trend: 'up',   change: +45, loc: 'Ratlam',    hist: [4950,4980,5010,5030,5070,5100] },
  { crop: 'Cotton', emoji: '🌼', msp: 6620, current: 6450, trend: 'down', change: -80, loc: 'Khandwa',   hist: [6700,6680,6620,6570,6510,6450] },
];

const MY_LISTINGS = [
  { id: 1, crop: 'Wheat 🌾', qty: '20 quintal', price: 2150, status: 'active',   buyer: null,          date: '10 May' },
  { id: 2, crop: 'Tomato 🍅', qty: '5 quintal',  price: 44,   status: 'pending',  buyer: 'Ravi Traders', date: '9 May' },
];

// Simple sparkline SVG
function Sparkline({ data, color }) {
  const W = 80, H = 30;
  const min = Math.min(...data), max = Math.max(...data);
  const xStep = W / (data.length - 1);
  const y = v => H - ((v - min) / (max - min || 1)) * H;
  const points = data.map((v, i) => `${i * xStep},${y(v)}`).join(' ');
  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) * xStep} cy={y(data[data.length - 1])} r="3" fill={color} />
    </svg>
  );
}

export default function MarketplaceSell({ navigate }) {
  const { firebaseUser, showToast } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ crop: '', qty: '', unit: 'quintal', price: '', location: '' });
  const [listings, setListings] = useState(MY_LISTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
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
      farmer: firebaseUser?.displayName || 'Unknown Farmer',
      photo: '🌾'
    };

    try {
      if (firebaseUser?.uid && firebaseUser.uid !== 'demo') {
        const refId = await addListing(firebaseUser.uid, newListing);
        setListings(prev => [{ id: refId, ...newListing, status: 'active', date: 'Today' }, ...prev]);
        showToast('Listing added successfully!');
      } else {
        // Fallback for demo mode
        setListings(prev => [{ id: Date.now(), ...newListing, status: 'active', date: 'Today' }, ...prev]);
        showToast('Demo listing added!');
      }
      setForm({ crop: '', qty: '', unit: 'quintal', price: '', location: '' });
      setShowAdd(false);
    } catch (err) {
      console.error('Failed to add listing', err);
      showToast('Failed to add listing', 'error');
    }
  };

  return (
    <div className="anim-page">
      <div className="dashboard-greeting">
        <div>
          <h1 className="page-title">🛒 Marketplace</h1>
          <p className="page-sub hindi">Apni fasal becho · Mandi ke bhav dekho</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Nayi Listing Banao</button>
      </div>

      {/* Price Table */}
      <div className="card anim-fadeup delay-1" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <div className="section-title">📊 Live Mandi Prices <span className="badge badge-live ml-2"><span className="live-dot" /> Live</span></div>
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Last updated: 2 min ago</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Crop</th><th>Current Price</th><th>MSP</th><th>Change</th><th>Trend</th><th>Mandi</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {MANDI_PRICES.map(m => (
                <tr key={m.crop}>
                  <td><span style={{ fontSize: 18, marginRight: 6 }}>{m.emoji}</span><b>{m.crop}</b></td>
                  <td style={{ fontWeight: 700, fontSize: 'var(--text-md)' }}>₹{m.current}<span style={{ fontSize: 11, color: 'var(--text-light)' }}>/qtl</span></td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{m.msp ? `₹${m.msp}` : '—'}</td>
                  <td>
                    <span className={`badge ${m.trend === 'up' ? 'badge-green' : 'badge-red'}`}>
                      {m.trend === 'up' ? '↑' : '↓'} ₹{Math.abs(m.change)}
                    </span>
                  </td>
                  <td><Sparkline data={m.hist} color={m.trend === 'up' ? '#16A34A' : '#DC2626'} /></td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{m.loc}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>Becho</button>
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
          <div className="section-title">📦 Meri Listings</div>
          <span className="badge badge-primary">{listings.length} active</span>
        </div>
        {listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <p className="hindi">Abhi koi listing nahi hai. Nayi listing banao!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {listings.map(l => (
              <div key={l.id} className="card card-flat listing-card">
                <div className="flex justify-between items-center">
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-md)' }}>{l.crop}</span>
                  <span className={`badge ${l.status === 'active' ? 'badge-green' : l.status === 'pending' ? 'badge-amber' : 'badge-gray'}`}>
                    {l.status === 'active' ? '✓ Active' : l.status === 'pending' ? '⏳ Buyer ne interest dikhaya' : 'Completed'}
                  </span>
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  <span>📦 {l.qty}</span>
                  <span>💰 ₹{l.price}</span>
                  <span>📅 {l.date}</span>
                </div>
                {l.buyer && (
                  <div className="alert-item alert-success" style={{ marginTop: 10 }}>
                    🏪 {l.buyer} chahta hai — Accept karo?
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>Accept</button>
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
              <h3 className="modal-title hindi">📦 Nayi Listing Banao</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Crop Name</label>
                <input className="form-input" placeholder="e.g. Wheat, Tomato" value={form.crop} onChange={e => setForm(f => ({ ...f, crop: e.target.value }))} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input className="form-input" type="number" placeholder="Amount" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select className="form-input form-select" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                    <option>quintal</option><option>kg</option><option>ton</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Asking Price (₹ per {form.unit})</label>
                <input className="form-input" type="number" placeholder="Price" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Village / Town</label>
                <input className="form-input" placeholder="e.g. Sehore" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-primary btn-full" onClick={handleAddListing}>✓ Listing Banao</button>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
