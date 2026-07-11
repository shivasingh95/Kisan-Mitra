import React, { useState, useEffect } from 'react';
import './pages.css';
import { getActiveListings } from '@/services/firebase/firestore.service';
import { useApp } from '@/context/AppContext';

const LISTINGS = [
  { id: 1, farmer: 'Ramesh Kumar', loc: 'Sehore, MP', crop: 'Wheat 🌾', qty: '20 quintal', price: 2150, organic: false, delivery: true, rating: 4.7, photo: '🌾' },
  { id: 2, farmer: 'Sunita Devi', loc: 'Vidisha, MP', crop: 'Tomato 🍅', qty: '5 quintal', price: 45, organic: true, delivery: false, rating: 4.9, photo: '🍅' },
  { id: 3, farmer: 'Mohan Patel', loc: 'Ujjain, MP', crop: 'Onion 🧅', qty: '10 quintal', price: 28, organic: false, delivery: true, rating: 4.5, photo: '🧅' },
  { id: 4, farmer: 'Geeta Sharma', loc: 'Indore, MP', crop: 'Maize 🌽', qty: '30 quintal', price: 1850, organic: true, delivery: true, rating: 4.8, photo: '🌽' },
  { id: 5, farmer: 'Ashok Singh', loc: 'Bhopal, MP', crop: 'Rice 🍚', qty: '15 quintal', price: 3200, organic: false, delivery: false, rating: 4.6, photo: '🍚' },
  { id: 6, farmer: 'Priya Bai', loc: 'Dewas, MP', crop: 'Potato 🥔', qty: '8 quintal', price: 22, organic: false, delivery: true, rating: 4.3, photo: '🥔' },
];

const ORDERS = [
  { id: 1, crop: 'Wheat 🌾', farmer: 'Ramesh Kumar', qty: '5 qtl', amount: 10750, status: 'delivered', date: '5 May' },
  { id: 2, crop: 'Tomato 🍅', farmer: 'Sunita Devi', qty: '2 qtl', amount: 9000, status: 'in-transit', date: '9 May' },
  { id: 3, crop: 'Onion 🧅', farmer: 'Mohan Patel', qty: '3 qtl', amount: 8400, status: 'confirmed', date: '10 May' },
];

const STATUS_CFG = {
  delivered: { label: 'Delivered', color: '#16A34A', bg: '#DCFCE7' },
  'in-transit': { label: 'In Transit 🚚', color: '#2563EB', bg: '#DBEAFE' },
  confirmed: { label: 'Confirmed', color: '#D97706', bg: '#FEF9C3' },
};

export default function MarketplaceBrowse() {
  const { showToast } = useApp();
  const [tab, setTab] = useState('browse');
  const [filters, setFilters] = useState({ organic: false, delivery: false });
  const [selected, setSelected] = useState(null);
  const [ordered, setOrdered] = useState([]);
  
  const [listings, setListings] = useState(LISTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchListings = async () => {
      try {
        const data = await getActiveListings(20);
        if (mounted) {
          if (data && data.length > 0) setListings(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch listings', err);
        if (mounted) setLoading(false);
      }
    };
    fetchListings();
    return () => { mounted = false; };
  }, []);

  const filtered = listings.filter(l =>
    (!filters.organic || l.organic) &&
    (!filters.delivery || l.delivery)
  );

  return (
    <div className="anim-page">
      <div className="dashboard-greeting">
        <div>
          <h1 className="page-title">🛍️ Browse Market</h1>
          <p className="page-sub hindi">Fresh produce directly from farmers — guaranteed quality</p>
        </div>
      </div>

      <div className="pill-group" style={{ marginBottom: 20 }}>
        <button className={`pill ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>🛍️ Browse Listings</button>
        <button className={`pill ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>📦 My Orders ({ORDERS.length})</button>
      </div>

      {tab === 'browse' && (
        <>
          {/* Filters */}
          <div className="flex gap-3 items-center" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Filter:</span>
            {[
              { key: 'organic', label: '🌿 Organic Only' },
              { key: 'delivery', label: '🚚 Delivery Available' },
            ].map(f => (
              <button
                key={f.key}
                className={`pill ${filters[f.key] ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
              >
                {f.label}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{filtered.length} listings</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Loading listings...</div>
          ) : (
            <div className="grid-3">
              {filtered.map((l, i) => (
                <div key={l.id} className={`card card-3d anim-fadeup delay-${i % 6 + 1}`}>
                  {/* Photo */}
                  <div style={{
                    height: 100, background: 'linear-gradient(135deg, var(--green-200), var(--green-100))',
                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 56, marginBottom: 14
                  }}>
                    {l.photo || '🌾'}
                  </div>

                  <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                    <h3 style={{ fontWeight: 700 }}>{l.crop}</h3>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {l.organic && <span className="badge badge-green">🌿 Organic</span>}
                      {l.delivery && <span className="badge badge-blue">🚚</span>}
                    </div>
                  </div>

                  <div style={{ fontSize: 'var(--text-md)', fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
                    ₹{l.price}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/{l.unit || 'unit'}</span>
                  </div>

                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 12 }}>
                    <div>👨‍🌾 {l.farmer || l.uid?.substring(0, 8)}</div>
                    <div>📍 {l.loc || l.location || 'Unknown'}</div>
                    <div>📦 {l.qty} available</div>
                    {l.rating && <div>⭐ {l.rating}</div>}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className={`btn btn-primary btn-sm btn-full ${ordered.includes(l.id) ? 'btn-ghost' : ''}`}
                      disabled={ordered.includes(l.id)}
                      onClick={() => setOrdered(o => [...o, l.id])}
                    >
                      {ordered.includes(l.id) ? '✓ Order Placed' : '🛒 Order Karo'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(l)}>ℹ️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ORDERS.map((o, i) => {
            const cfg = STATUS_CFG[o.status];
            return (
              <div key={o.id} className={`card card-flat anim-fadeup delay-${i + 1}`}>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <span style={{ fontSize: 36 }}>{o.crop.split(' ')[1]}</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>Order #{o.id} — {o.crop}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        👨‍🌾 {o.farmer} · 📦 {o.qty} · 📅 {o.date}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>₹{o.amount.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span style={{ background: cfg.bg, color: cfg.color, padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{cfg.label}</span>
                    <button className="btn btn-ghost btn-sm">⭐ Rate Farmer</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontSize: 48 }}>{selected.photo}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: '12px 0 4px' }}>{selected.crop}</h3>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--primary)', marginBottom: 16 }}>
              ₹{selected.price}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>/unit</span>
            </div>
            {[['Farmer', selected.farmer],['Location',selected.loc],['Available',selected.qty],['Rating',`⭐ ${selected.rating}`]].map(([k,v]) => (
              <div key={k} style={{ display:'flex', gap:12, padding:'8px 0', borderBottom:'1px solid var(--border-light)', fontSize:'var(--text-sm)' }}>
                <span style={{ fontWeight:600, minWidth:80 }}>{k}</span>
                <span style={{ color:'var(--text-muted)' }}>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex', gap:4, marginTop:12, flexWrap:'wrap' }}>
              {selected.organic && <span className="badge badge-green">🌿 Organic</span>}
              {selected.delivery && <span className="badge badge-blue">🚚 Delivery Available</span>}
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop:20 }} onClick={() => { setOrdered(o=>[...o,selected.id]); setSelected(null); }}>
              🛒 Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

