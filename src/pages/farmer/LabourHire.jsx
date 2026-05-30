// src/pages/farmer/LabourHire.jsx — Labour & Equipment marketplace (4-tab upgrade)
import React, { useState, useEffect } from 'react';
import './pages.css';
import { MOCK_WORKERS, SKILLS, getSkill } from '../../data/mockWorkers';
import { getAllWorkers } from '../../services/db';
import FarmerJobPost    from '../../components/Labour/FarmerJobPost.jsx';
import FarmerHiringPanel from '../../components/Labour/FarmerHiringPanel.jsx';
import WorkerProfileCard from '../../components/Labour/WorkerProfileCard.jsx';

const EQUIPMENT = [
  { id: 1, name: 'John Deere Tractor', hi: 'ट्रैक्टर',   icon: '🚜', rate: 800,  unit: '/hr',   owner: 'Ram Singh',    avail: true,  loc: 'Sehore',  slots: ['8 AM – 10 AM', '2 PM – 5 PM'] },
  { id: 2, name: 'Multi-Rotor Drone',  hi: 'ड्रोन',       icon: '🚁', rate: 1200, unit: '/acre', owner: 'AgriTech Co',  avail: true,  loc: 'Bhopal',  slots: ['9 AM – 11 AM', '3 PM – 5 PM'] },
  { id: 3, name: 'Combine Harvester',  hi: 'कम्बाइन',     icon: '⚙️', rate: 1500, unit: '/acre', owner: 'Krishi Yantra', avail: false, loc: 'Vidisha', slots: [] },
  { id: 4, name: 'Seed Drill',         hi: 'बीज यन्त्र',  icon: '🌱', rate: 400,  unit: '/acre', owner: 'FPO Sehore',   avail: true,  loc: 'Sehore',  slots: ['7 AM – 9 AM', '4 PM – 6 PM'] },
];

const TABS = [
  { id: 'workers',   label: 'Find Workers',  labelHi: 'श्रमिक खोजें',    icon: '👷' },
  { id: 'equipment', label: 'Equipment Rent',labelHi: 'उपकरण किराया',    icon: '🚜' },
  { id: 'post-job',  label: 'Post a Job',    labelHi: 'काम पोस्ट करें',  icon: '📋' },
  { id: 'my-hirings',label: 'My Hirings',    labelHi: 'मेरी भर्तियां',   icon: '📂' },
];

export default function LabourHire() {
  const [activeTab,   setActiveTab]   = useState('workers');
  const [skillFilter, setSkillFilter] = useState('all');
  const [workers,     setWorkers]     = useState(MOCK_WORKERS); // start with mock
  const [requested,   setRequested]   = useState({});
  const [booked,      setBooked]      = useState({});

  // Try to load real Firestore workers; fall back to MOCK_WORKERS
  useEffect(() => {
    getAllWorkers().then(data => {
      if (data && data.length > 0) setWorkers(data);
    }).catch(() => { /* keep mock data */ });
  }, []);

  const filtered = skillFilter === 'all'
    ? workers
    : workers.filter(w => w.skills?.includes(skillFilter));

  return (
    <div className="anim-page">
      <div className="dashboard-greeting">
        <div>
          <h1 className="page-title">👷 Labour &amp; Equipment</h1>
          <p className="page-sub hindi">Kaam ke liye trained workers ya modern equipment dhoondo</p>
        </div>
      </div>

      {/* ── Main Tab Bar ── */}
      <div className="pill-group" style={{ marginBottom: 24 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`pill ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} {t.label}
            <span className="hindi" style={{ fontSize: 11, marginLeft: 4, opacity: 0.8 }}>{t.labelHi}</span>
          </button>
        ))}
      </div>

      {/* ════════════════ FIND WORKERS TAB ════════════════ */}
      {activeTab === 'workers' && (
        <>
          {/* Skill filter pills */}
          <div className="pill-group" style={{ marginBottom: 20 }}>
            <button
              className={`pill ${skillFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSkillFilter('all')}
            >All Skills</button>
            {SKILLS.map(s => (
              <button
                key={s.id}
                className={`pill ${skillFilter === s.id ? 'active' : ''}`}
                onClick={() => setSkillFilter(s.id)}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <p style={{ fontSize: '2rem' }}>🔍</p>
              <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                No workers found for this skill filter.
              </p>
            </div>
          ) : (
            <div className="grid-2">
              {filtered.map((w, i) => (
                <WorkerProfileCard
                  key={w.workerId || w.id}
                  worker={w}
                  onAccept={
                    w.isAvailable && !requested[w.workerId]
                      ? () => setRequested(r => ({ ...r, [w.workerId]: true }))
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {/* Requested workers feedback */}
          {Object.keys(requested).length > 0 && (
            <div className="card" style={{ marginTop: 16, background: '#EDF7F1', border: '1.5px solid #BBE5CB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#186E3C', fontWeight: 600 }}>
                ✅ Hire requests sent to {Object.keys(requested).length} worker(s).
                <span className="hindi" style={{ fontSize: 12, fontWeight: 400, color: '#6B9E80' }}>
                  श्रमिकों को अनुरोध भेजा गया।
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════════════ EQUIPMENT TAB ════════════════ */}
      {activeTab === 'equipment' && (
        <div className="grid-2">
          {EQUIPMENT.map((eq, i) => (
            <div key={eq.id} className={`card card-3d anim-fadeup delay-${i % 4 + 1}`}>
              <div className="flex gap-3 items-center" style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 40 }}>{eq.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-md)' }}>{eq.name}</div>
                  <div className="hindi" style={{ fontSize: 12, color: 'var(--text-light)' }}>{eq.hi}</div>
                  <span className={`badge ${eq.avail ? 'badge-green' : 'badge-gray'}`}>
                    {eq.avail ? '● Available' : '○ Booked'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 12 }}>
                <span>💰 ₹{eq.rate}{eq.unit}</span>
                <span>👤 {eq.owner}</span>
                <span>📍 {eq.loc}</span>
              </div>
              {eq.slots.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {eq.slots.map(s => (
                    <span key={s} style={{ background: 'var(--primary-ghost)', padding: '4px 10px', borderRadius: 6, fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                      🕐 {s}
                    </span>
                  ))}
                </div>
              )}
              <button
                className={`btn btn-full ${booked[eq.id] ? 'btn-ghost' : 'btn-primary'}`}
                disabled={!eq.avail || booked[eq.id]}
                onClick={() => setBooked(b => ({ ...b, [eq.id]: true }))}
              >
                {booked[eq.id] ? '✓ Booked!' : eq.avail ? '📅 Book Now' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════ POST A JOB TAB ════════════════ */}
      {activeTab === 'post-job' && (
        <FarmerJobPost onJobPosted={() => setActiveTab('my-hirings')} />
      )}

      {/* ════════════════ MY HIRINGS TAB ════════════════ */}
      {activeTab === 'my-hirings' && (
        <FarmerHiringPanel />
      )}
    </div>
  );
}
