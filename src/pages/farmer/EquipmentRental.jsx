// src/pages/farmer/EquipmentRental.jsx — Full Equipment RaaS page (System 2)
// All 4 tabs: Search, My Bookings, List Equipment (owner), Owner Bookings
import React, { useState, useMemo } from 'react';
import './EquipmentRental.css';
import {
  MOCK_EQUIPMENT, MOCK_BOOKINGS, MOCK_OWNERS,
  EQUIPMENT_TYPES, OWNER_SOURCES, getEquipmentType
} from '../../data/mockEquipment';
import { MP_DISTRICTS } from '../../data/mockWorkers';
import EquipmentCard from '../../components/Equipment/EquipmentCard';
import { useApp } from '../../context/AppContext.jsx';

const TABS = [
  { id: 'search',        label: 'Search Equipment', labelHi: 'उपकरण खोजें',    icon: '🔍' },
  { id: 'my-bookings',   label: 'My Bookings',      labelHi: 'मेरी बुकिंग',     icon: '📅' },
  { id: 'list-equipment',label: 'List My Equipment', labelHi: 'उपकरण लिस्ट करें', icon: '➕' },
  { id: 'owner-bookings',label: 'Owner Bookings',   labelHi: 'स्वामी बुकिंग',   icon: '🔔' },
];

const SORT_OPTIONS = [
  { id: 'rating',  label: '⭐ Rating'  },
  { id: 'price',   label: '₹ Price'   },
  { id: 'nearest', label: '📍 Nearest' },
];

// ── Booking status badge helper ────────────────────────────────
const STATUS_CFG = {
  pending:     { label: '🟡 Pending Confirmation', cls: 'er-status-pending'    },
  confirmed:   { label: '🔵 Confirmed',            cls: 'er-status-confirmed'  },
  in_progress: { label: '🟠 In Progress',          cls: 'er-status-in_progress'},
  completed:   { label: '✅ Completed',             cls: 'er-status-completed'  },
  cancelled:   { label: '❌ Cancelled',             cls: 'er-status-cancelled'  },
  disputed:    { label: '⚠️ Disputed',              cls: 'er-status-pending'    },
};

export default function EquipmentRental() {
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState('search');

  // ── Search / Filter state ─────────────────────────────────
  const [filters, setFilters] = useState({ type: '', district: '', maxPrice: '', date: '' });
  const [sort, setSort]       = useState('rating');
  const [bookings, setBookings] = useState(MOCK_BOOKINGS); // all mock bookings
  const [bookedIds, setBookedIds] = useState({}); // equipId → bookingId (in-session)

  // ── Listing form state ────────────────────────────────────
  const [listForm, setListForm] = useState({
    type: '', brand: '', model: '', ratePerHour: '', coveragePerHour: '',
    districts: '', description: '', dgcaCert: false, dgcaCertNo: ''
  });
  const [listSuccess, setListSuccess] = useState(false);

  // ── Owner bookings (mock incoming confirmations) ───────────
  const [ownerPending, setOwnerPending] = useState([
    {
      id: 'ob001', farmerName: 'Suresh Sharma', farmerDistrict: 'Sehore',
      equipId: 'eq001', hours: 3, date: '2026-06-08', slotLabel: '8 AM – 10 AM',
      total: 966, ownerGets: 714, status: 'pending',
    },
    {
      id: 'ob002', farmerName: 'Anita Yadav', farmerDistrict: 'Dewas',
      equipId: 'eq004', hours: 2, date: '2026-06-09', slotLabel: '4 PM – 6 PM',
      total: 276, ownerGets: 204, status: 'pending',
    },
  ]);

  // ── Filtered + sorted equipment ───────────────────────────
  const filteredEquipment = useMemo(() => {
    let list = [...MOCK_EQUIPMENT];
    if (filters.type)     list = list.filter(e => e.type === filters.type);
    if (filters.district) list = list.filter(e => e.districts?.includes(filters.district));
    if (filters.maxPrice) list = list.filter(e => e.ratePerHour <= Number(filters.maxPrice));

    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (sort === 'price')  list.sort((a, b) => a.ratePerHour - b.ratePerHour);
    return list;
  }, [filters, sort]);

  // ── Handle booking confirmation ────────────────────────────
  const handleBook = (equipment, bookingData) => {
    const newBooking = {
      bookingId:    `bk_${Date.now()}`,
      equipId:      equipment.equipId,
      farmerName:   'Demo Farmer',
      hours:        bookingData.hours,
      date:         new Date(bookingData.date).getTime(),
      slotLabel:    bookingData.slotLabel,
      baseAmount:   bookingData.base,
      platformFee:  bookingData.platformFee,
      totalPaid:    bookingData.total,
      ownerReceives:bookingData.ownerGets,
      status:       'confirmed',
      escrowHeld:   true,
      escrowAmount: bookingData.total,
    };
    setBookings(prev => [newBooking, ...prev]);
    setBookedIds(prev => ({ ...prev, [equipment.equipId]: newBooking.bookingId }));
    showToast(`✅ Booking confirmed! ₹${bookingData.total} held in escrow.`, 'success');
    setActiveTab('my-bookings');
  };

  // ── Handle service received ────────────────────────────────
  const handleServiceReceived = (bookingId) => {
    setBookings(prev => prev.map(b =>
      b.bookingId === bookingId ? { ...b, status: 'completed', escrowHeld: false } : b
    ));
    showToast('💸 Payment released to equipment owner!', 'success');
  };

  // ── Handle raise dispute ────────────────────────────────────
  const handleDispute = (bookingId) => {
    setBookings(prev => prev.map(b =>
      b.bookingId === bookingId ? { ...b, status: 'disputed' } : b
    ));
    showToast('⚠️ Dispute raised. Resolution within 48 hours.', 'warning');
  };

  // ── Handle owner accept/decline ────────────────────────────
  const handleOwnerAccept = (id) => {
    setOwnerPending(prev => prev.map(o => o.id === id ? { ...o, status: 'accepted' } : o));
    showToast('✅ Booking accepted! Farmer notified.', 'success');
  };
  const handleOwnerDecline = (id) => {
    setOwnerPending(prev => prev.map(o => o.id === id ? { ...o, status: 'declined' } : o));
    showToast('Booking declined. Auto-refund to farmer initiated.', 'info');
  };

  // ── Listing form submit ────────────────────────────────────
  const handleListSubmit = (e) => {
    e.preventDefault();
    if (!listForm.type || !listForm.brand || !listForm.ratePerHour) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }
    setListSuccess(true);
    showToast('🎉 Equipment listed! Verification in 24 hours.', 'success');
  };

  const setF = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const setL = (key, val) => setListForm(f => ({ ...f, [key]: val }));

  return (
    <div className="anim-page">
      {/* ── Hero ── */}
      <div className="er-hero">
        <div className="er-hero-label">System 2 — Equipment RaaS</div>
        <h1 className="er-hero-title">🚁 Equipment Rental</h1>
        <p className="er-hero-sub">उपकरण किराया — Drone, Tractor, Harvester book karo</p>
        <div className="er-hero-stats">
          <div className="er-hero-stat">
            <div className="er-hero-stat-val">{MOCK_EQUIPMENT.filter(e => e.isAvailable).length}</div>
            <div className="er-hero-stat-lbl">Available Now</div>
          </div>
          <div className="er-hero-stat">
            <div className="er-hero-stat-val">{MOCK_OWNERS.length}+</div>
            <div className="er-hero-stat-lbl">Verified Owners</div>
          </div>
          <div className="er-hero-stat">
            <div className="er-hero-stat-val">15%</div>
            <div className="er-hero-stat-lbl">Platform Fee</div>
          </div>
          <div className="er-hero-stat">
            <div className="er-hero-stat-val">4hrs</div>
            <div className="er-hero-stat-lbl">Auto-release</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="er-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`er-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} {t.label}
            <span className="er-tab-hi">{t.labelHi}</span>
          </button>
        ))}
      </div>

      {/* ════════════════ SEARCH TAB ════════════════ */}
      {activeTab === 'search' && (
        <>
          {/* Where do equipment owners come from? */}
          <div className="er-sources">
            <div className="er-sources-title">🏭 Equipment Owners on Platform</div>
            <div className="er-source-grid">
              {OWNER_SOURCES.map(s => (
                <div key={s.id} className="er-source-card">
                  <div className="er-source-icon">{s.icon}</div>
                  <div className="er-source-label">{s.label}</div>
                </div>
              ))}
              <div className="er-source-card">
                <div className="er-source-icon">🚁</div>
                <div className="er-source-label">Platform-Owned Fleet (Coming Soon)</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="er-filters">
            <div className="er-filter-group">
              <label className="er-filter-label">Equipment Type</label>
              <select
                className="er-filter-select"
                value={filters.type}
                onChange={e => setF('type', e.target.value)}
              >
                <option value="">All Types</option>
                {EQUIPMENT_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
            <div className="er-filter-group">
              <label className="er-filter-label">District</label>
              <select
                className="er-filter-select"
                value={filters.district}
                onChange={e => setF('district', e.target.value)}
              >
                <option value="">All Districts</option>
                {MP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="er-filter-group">
              <label className="er-filter-label">Max Price (₹/hr)</label>
              <input
                type="number"
                className="er-filter-input"
                placeholder="e.g. 500"
                value={filters.maxPrice}
                onChange={e => setF('maxPrice', e.target.value)}
              />
            </div>
            <div className="er-filter-group">
              <label className="er-filter-label">Date Needed</label>
              <input
                type="date"
                className="er-filter-input"
                value={filters.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setF('date', e.target.value)}
              />
            </div>
            <div className="er-filter-group">
              <label className="er-filter-label">&nbsp;</label>
              <button
                className="er-filter-btn"
                onClick={() => setFilters({ type: '', district: '', maxPrice: '', date: '' })}
              >
                ↺ Clear
              </button>
            </div>
          </div>

          {/* Results header */}
          <div className="er-results-header">
            <div className="er-results-count">
              {filteredEquipment.length} equipment found
              {filteredEquipment.filter(e => e.isAvailable).length > 0 &&
                ` · ${filteredEquipment.filter(e => e.isAvailable).length} available now`
              }
            </div>
            <div className="er-results-sort">
              {SORT_OPTIONS.map(s => (
                <button
                  key={s.id}
                  className={`er-sort-btn ${sort === s.id ? 'active' : ''}`}
                  onClick={() => setSort(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment grid */}
          {filteredEquipment.length === 0 ? (
            <div className="er-empty">
              <div className="er-empty-icon">🔍</div>
              <p>No equipment found for your filters.</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>
                Try removing some filters or selecting a different district.
              </p>
            </div>
          ) : (
            <div className="er-grid">
              {filteredEquipment.map((eq, i) => (
                <EquipmentCard
                  key={eq.equipId}
                  equipment={eq}
                  bookedBookingId={bookedIds[eq.equipId]}
                  onBook={handleBook}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════ MY BOOKINGS TAB ════════════════ */}
      {activeTab === 'my-bookings' && (
        <>
          {bookings.length === 0 ? (
            <div className="er-booking-empty">
              <div className="er-booking-empty-icon">📅</div>
              <h3 style={{ marginBottom: 8, color: 'var(--text-900)' }}>No Bookings Yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                Book equipment from the Search tab to see it here.
              </p>
              <button className="btn btn-primary" onClick={() => setActiveTab('search')}>
                🔍 Search Equipment
              </button>
            </div>
          ) : (
            <div className="er-bookings-list">
              {bookings.map(bk => {
                const eq  = MOCK_EQUIPMENT.find(e => e.equipId === bk.equipId) || {};
                const eqT = getEquipmentType(eq.type || 'drone');
                const scfg = STATUS_CFG[bk.status] || STATUS_CFG.pending;
                return (
                  <div key={bk.bookingId} className="er-booking-card">
                    {/* Top row */}
                    <div className="er-booking-top">
                      <div className="er-booking-icon">{eqT.icon}</div>
                      <div className="er-booking-info">
                        <div className="er-booking-name">
                          {eq.brand || 'Equipment'} {eq.model || ''}
                        </div>
                        <div className="er-booking-meta">
                          📅 {bk.date ? new Date(bk.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          &nbsp;·&nbsp; 🕐 {bk.slotLabel}
                          &nbsp;·&nbsp; {bk.hours} hrs
                        </div>
                      </div>
                      <span className={`er-booking-status-badge ${scfg.cls}`}>
                        {scfg.label}
                      </span>
                    </div>

                    {/* Escrow banner */}
                    {bk.escrowHeld && bk.status !== 'completed' && (
                      <div className="er-booking-escrow">
                        <span>🔒</span>
                        <span>
                          Payment Secured (Mock) — ₹{bk.escrowAmount?.toLocaleString('en-IN')} held in escrow.
                          Owner receives only after you confirm service.
                        </span>
                      </div>
                    )}

                    {/* Payment breakdown */}
                    <div className="er-booking-payment-row">
                      <div className="er-pay-cell">
                        <div className="er-pay-val">₹{bk.totalPaid?.toLocaleString('en-IN')}</div>
                        <div className="er-pay-lbl">You Paid</div>
                      </div>
                      <div className="er-pay-cell">
                        <div className="er-pay-val">₹{bk.platformFee?.toLocaleString('en-IN')}</div>
                        <div className="er-pay-lbl">Platform Fee (15%)</div>
                      </div>
                      <div className="er-pay-cell" style={{ background: '#F0FDF4' }}>
                        <div className="er-pay-val" style={{ color: '#16A34A' }}>₹{bk.ownerReceives?.toLocaleString('en-IN')}</div>
                        <div className="er-pay-lbl">Owner Gets (85%)</div>
                      </div>
                    </div>

                    {/* Actions */}
                    {bk.status === 'confirmed' && (
                      <div className="er-booking-actions">
                        <button
                          className="er-action-btn confirm"
                          onClick={() => handleServiceReceived(bk.bookingId)}
                        >
                          ✅ Mark Service Received
                        </button>
                        <button
                          className="er-action-btn dispute"
                          onClick={() => handleDispute(bk.bookingId)}
                        >
                          ⚠️ Raise Dispute
                        </button>
                      </div>
                    )}
                    {bk.status === 'completed' && (
                      <div className="er-action-btn done" style={{ textAlign: 'center', marginTop: 0 }}>
                        ✅ Service Completed — ₹{bk.ownerReceives?.toLocaleString('en-IN')} released to owner
                      </div>
                    )}
                    {bk.status === 'disputed' && (
                      <div style={{
                        background: '#FEF2F2', border: '1px solid #FECACA',
                        borderRadius: 8, padding: '10px 14px', fontSize: 12,
                        color: '#DC2626', fontWeight: 600
                      }}>
                        ⚠️ Dispute raised. Resolution team will contact within 48 hours.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ════════════════ LIST EQUIPMENT TAB ════════════════ */}
      {activeTab === 'list-equipment' && (
        <>
          {listSuccess ? (
            <div className="er-list-success">
              <div className="er-list-success-icon">🎉</div>
              <h2 style={{ color: 'var(--text-900)', marginBottom: 8 }}>Equipment Listed!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
                Your equipment is under verification. You'll receive a Certified ✅ badge within 24 hours.
              </p>
              <p style={{ fontFamily: 'var(--font-hindi)', fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
                आपका उपकरण सत्यापन में है। 24 घंटे में प्रमाणित बैज मिलेगा।
              </p>
              <button className="btn btn-primary" onClick={() => setListSuccess(false)}>
                + List Another Equipment
              </button>
            </div>
          ) : (
            <form className="er-list-form" onSubmit={handleListSubmit}>
              <div className="er-list-title">➕ List Your Equipment</div>
              <div className="er-list-sub">अपना उपकरण किराए पर दें और अतिरिक्त आमदनी करें</div>

              {/* Equipment type + brand */}
              <div className="er-form-row">
                <div className="er-form-group">
                  <label className="er-form-label">Equipment Type *</label>
                  <select
                    className="er-form-select"
                    value={listForm.type}
                    onChange={e => setL('type', e.target.value)}
                    required
                  >
                    <option value="">Select type…</option>
                    {EQUIPMENT_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="er-form-group">
                  <label className="er-form-label">Brand / Manufacturer *</label>
                  <input
                    type="text"
                    className="er-form-input"
                    placeholder="e.g. Mahindra, Garuda"
                    value={listForm.brand}
                    onChange={e => setL('brand', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Model + rate */}
              <div className="er-form-row">
                <div className="er-form-group">
                  <label className="er-form-label">Model Name</label>
                  <input
                    type="text"
                    className="er-form-input"
                    placeholder="e.g. Arjun 605"
                    value={listForm.model}
                    onChange={e => setL('model', e.target.value)}
                  />
                </div>
                <div className="er-form-group">
                  <label className="er-form-label">Rate (₹/hour) *</label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    className="er-form-input"
                    placeholder="e.g. 280"
                    value={listForm.ratePerHour}
                    onChange={e => setL('ratePerHour', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Coverage + districts */}
              <div className="er-form-row">
                <div className="er-form-group">
                  <label className="er-form-label">Coverage (acres/hour)</label>
                  <input
                    type="number"
                    min="1"
                    className="er-form-input"
                    placeholder="e.g. 10"
                    value={listForm.coveragePerHour}
                    onChange={e => setL('coveragePerHour', e.target.value)}
                  />
                </div>
                <div className="er-form-group">
                  <label className="er-form-label">Districts Served (comma-separated)</label>
                  <input
                    type="text"
                    className="er-form-input"
                    placeholder="e.g. Indore, Dewas, Ujjain"
                    value={listForm.districts}
                    onChange={e => setL('districts', e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="er-form-group" style={{ marginBottom: 16 }}>
                <label className="er-form-label">Description</label>
                <textarea
                  className="er-form-textarea"
                  placeholder="Describe your equipment — features, condition, what it's best for…"
                  value={listForm.description}
                  onChange={e => setL('description', e.target.value)}
                />
              </div>

              {/* DGCA cert (for drones) */}
              {listForm.type === 'drone' && (
                <div className="er-dgca-box">
                  <strong>🚁 Drone Listing Requires DGCA Certification</strong>
                  DGCA (Directorate General of Civil Aviation) certificate is mandatory to list drones.
                  Platform verifies before publishing. Uncertified drones cannot be listed.
                  <div style={{ marginTop: 10 }}>
                    <input
                      type="text"
                      className="er-form-input"
                      placeholder="DGCA Certificate No. (e.g. DGCA-2025-MP-XXXX)"
                      value={listForm.dgcaCertNo}
                      onChange={e => setL('dgcaCertNo', e.target.value)}
                      style={{ background: '#fff' }}
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="er-list-submit">
                🚀 List Equipment — उपकरण सूचीबद्ध करें
              </button>
            </form>
          )}
        </>
      )}

      {/* ════════════════ OWNER BOOKINGS TAB ════════════════ */}
      {activeTab === 'owner-bookings' && (
        <div className="er-owner-bookings">
          {ownerPending.length === 0 ? (
            <div className="er-booking-empty">
              <div className="er-booking-empty-icon">🔔</div>
              <h3 style={{ color: 'var(--text-900)', marginBottom: 8 }}>No Pending Bookings</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Incoming booking requests will appear here. List your equipment first!
              </p>
            </div>
          ) : (
            ownerPending.map(ob => {
              const eq  = MOCK_EQUIPMENT.find(e => e.equipId === ob.equipId) || {};
              const eqT = getEquipmentType(eq.type || 'drone');
              const isDone = ob.status !== 'pending';
              return (
                <div key={ob.id} className="er-owner-booking-card">
                  {/* Header */}
                  <div className="er-booking-top" style={{ marginBottom: 10 }}>
                    <div className="er-booking-icon">{eqT.icon}</div>
                    <div className="er-booking-info">
                      <div className="er-booking-name">
                        Booking from: <strong>{ob.farmerName}</strong>
                      </div>
                      <div className="er-booking-meta">
                        {eq.brand} {eq.model} · 📅 {ob.date} · 🕐 {ob.slotLabel} · {ob.hours} hrs
                      </div>
                    </div>
                    {isDone && (
                      <span className={`er-booking-status-badge ${ob.status === 'accepted' ? 'er-status-confirmed' : 'er-status-cancelled'}`}>
                        {ob.status === 'accepted' ? '✅ Accepted' : '❌ Declined'}
                      </span>
                    )}
                  </div>

                  {/* Acceptance window warning */}
                  {!isDone && (
                    <div className="er-accept-window">
                      ⏰ Accept within 2 hours — else auto-refund issued to farmer
                    </div>
                  )}

                  {/* Payment summary */}
                  <div className="er-booking-payment-row">
                    <div className="er-pay-cell">
                      <div className="er-pay-val">₹{ob.total?.toLocaleString('en-IN')}</div>
                      <div className="er-pay-lbl">Farmer Paid</div>
                    </div>
                    <div className="er-pay-cell">
                      <div className="er-pay-val">₹{(ob.total - ob.ownerGets).toLocaleString('en-IN')}</div>
                      <div className="er-pay-lbl">Platform (15%)</div>
                    </div>
                    <div className="er-pay-cell" style={{ background: '#F0FDF4' }}>
                      <div className="er-pay-val" style={{ color: '#16A34A' }}>₹{ob.ownerGets?.toLocaleString('en-IN')}</div>
                      <div className="er-pay-lbl">You Receive</div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isDone && (
                    <div className="er-owner-actions">
                      <button className="er-accept-btn" onClick={() => handleOwnerAccept(ob.id)}>
                        ✅ Accept Booking
                      </button>
                      <button className="er-decline-btn" onClick={() => handleOwnerDecline(ob.id)}>
                        ❌ Decline
                      </button>
                    </div>
                  )}
                  {ob.status === 'accepted' && (
                    <div style={{
                      background: '#F0FDF4', borderRadius: 8, padding: '10px 14px',
                      fontSize: 12, color: '#15803D', fontWeight: 600, marginTop: 10
                    }}>
                      ✅ Accepted! Payment (₹{ob.ownerGets}) will release after farmer confirms service.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
