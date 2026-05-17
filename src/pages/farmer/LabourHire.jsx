import React, { useState } from 'react';
import './pages.css';

const LABOUR = [
  { id: 1, name: 'Mohan Yadav', hi: 'मोहन यादव', skill: 'Harvesting', skillHi: 'कटाई', exp: 8, rate: 650, loc: 'Sehore', dist: '4 km', rating: 4.7, avail: true, avatar: '👨', langs: ['Hindi'], count: 120 },
  { id: 2, name: 'Raju Patel',  hi: 'राजू पटेल',  skill: 'Sowing',     skillHi: 'बुवाई', exp: 5, rate: 550, loc: 'Ashta',  dist: '8 km', rating: 4.5, avail: true, avatar: '👷', langs: ['Hindi','Marwari'], count: 88 },
  { id: 3, name: 'Sunita Bai',  hi: 'सुनीता बाई', skill: 'Weeding',    skillHi: 'निराई', exp: 10,rate: 500, loc: 'Nasrullaganj',dist:'12 km',rating:4.8,avail:false,avatar:'👩',langs:['Hindi'],count:200},
  { id: 4, name: 'Ramesh Nai',  hi: 'रमेश नाई',  skill: 'Spraying',   skillHi: 'छिड़काव',exp: 6, rate: 700, loc: 'Bhopal', dist: '22 km', rating: 4.6, avail: true, avatar: '🧑', langs: ['Hindi','English'], count: 74 },
];

const SKILLS = ['All', 'Harvesting', 'Sowing', 'Weeding', 'Spraying', 'Irrigation'];
const EQUIPMENT = [
  { id: 1, name: 'John Deere Tractor', hi: 'ट्रैक्टर', icon: '🚜', rate: 800, unit: '/hr', owner: 'Ram Singh', avail: true, loc: 'Sehore', slots: ['8 AM - 10 AM', '2 PM - 5 PM'] },
  { id: 2, name: 'Multi-Rotor Drone', hi: 'ड्रोन',   icon: '🚁', rate: 1200, unit: '/acre', owner: 'AgriTech Co', avail: true, loc: 'Bhopal', slots: ['9 AM - 11 AM', '3 PM - 5 PM'] },
  { id: 3, name: 'Combine Harvester',  hi: 'कम्बाइन', icon: '⚙️', rate: 1500, unit: '/acre', owner: 'Krishi Yantra', avail: false, loc: 'Vidisha', slots: [] },
  { id: 4, name: 'Seed Drill',         hi: 'बीज यन्त्र', icon: '🌱', rate: 400,  unit: '/acre', owner: 'FPO Sehore',  avail: true, loc: 'Sehore', slots: ['7 AM - 9 AM', '4 PM - 6 PM'] },
];

export default function LabourHire() {
  const [activeTab, setActiveTab] = useState('labour');
  const [skillFilter, setSkillFilter] = useState('All');
  const [requested, setRequested] = useState({});
  const [booked, setBooked] = useState({});

  const filtered = skillFilter === 'All' ? LABOUR : LABOUR.filter(l => l.skill === skillFilter);

  return (
    <div className="anim-page">
      <div className="dashboard-greeting">
        <div>
          <h1 className="page-title">{activeTab === 'labour' ? '👷 Labour Hire' : '🚜 Equipment Rent'}</h1>
          <p className="page-sub hindi">{activeTab === 'labour' ? 'Kaam ke liye trained workers dhoondo' : 'Tractor, drone, harvester — seedha book karo'}</p>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="pill-group" style={{ marginBottom: 24 }}>
        <button className={`pill ${activeTab === 'labour' ? 'active' : ''}`} onClick={() => setActiveTab('labour')}>👷 Labour Hire</button>
        <button className={`pill ${activeTab === 'equipment' ? 'active' : ''}`} onClick={() => setActiveTab('equipment')}>🚜 Equipment Rent</button>
      </div>

      {activeTab === 'labour' && (
        <>
          <div className="pill-group" style={{ marginBottom: 20 }}>
            {SKILLS.map(s => <button key={s} className={`pill ${skillFilter === s ? 'active' : ''}`} onClick={() => setSkillFilter(s)}>{s}</button>)}
          </div>
          <div className="grid-2">
            {filtered.map((w, i) => (
              <div key={w.id} className={`card card-3d anim-fadeup delay-${i % 4 + 1}`}>
                <div className="flex gap-3">
                  <div style={{ fontSize: 44, lineHeight: 1, flexShrink: 0 }}>{w.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 'var(--text-md)' }}>{w.name}</h3>
                      <span className={`badge ${w.avail ? 'badge-green' : 'badge-gray'}`}>{w.avail ? '● Available' : '○ Busy'}</span>
                    </div>
                    <div className="hindi" style={{ fontSize: 12, color: 'var(--text-light)' }}>{w.hi}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                      <span className="badge badge-primary">{w.skill}</span>
                      <span style={{ marginLeft: 8 }}>📍 {w.dist}</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  <span>💰 ₹{w.rate}/day</span>
                  <span>🎓 {w.exp} yr exp</span>
                  <span>✅ {w.count} kaam</span>
                  <span>⭐ {w.rating}</span>
                </div>
                <button
                  className={`btn btn-full ${requested[w.id] ? 'btn-ghost' : 'btn-primary'}`}
                  style={{ marginTop: 14 }}
                  disabled={!w.avail || requested[w.id]}
                  onClick={() => setRequested(r => ({ ...r, [w.id]: true }))}
                >
                  {requested[w.id] ? '✓ Request Bheja Gaya' : w.avail ? '📩 Hire Request Bhejo' : 'Abhi Available Nahi'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

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
                    <span key={s} style={{ background: 'var(--primary-ghost)', padding: '4px 10px', borderRadius: 6, fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>🕐 {s}</span>
                  ))}
                </div>
              )}
              <button
                className={`btn btn-full ${booked[eq.id] ? 'btn-ghost' : 'btn-primary'}`}
                disabled={!eq.avail || booked[eq.id]}
                onClick={() => setBooked(b => ({ ...b, [eq.id]: true }))}
              >
                {booked[eq.id] ? '✓ Booked!' : eq.avail ? '📅 Abhi Book Karo' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
