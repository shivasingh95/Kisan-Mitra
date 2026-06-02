// src/pages/SystemOverview.jsx — Hackathon showpiece: both systems side-by-side
import React from 'react';
import './SystemOverview.css';

const LABOUR_STEPS = [
  { n: 1, text: 'Worker registers — OTP, skills, Aadhaar, UPI',          actor: 'worker',   label: '👷 Worker'   },
  { n: 2, text: 'Farmer posts job — crop, type, workers, rate, GPS',      actor: 'farmer',   label: '👨‍🌾 Farmer'  },
  { n: 3, text: 'AI matching — skill + 50km radius + date + rate filter', actor: 'platform', label: '🏛️ Platform'  },
  { n: 4, text: 'Worker gets notification, reviews job, taps Apply',      actor: 'worker',   label: '👷 Worker'   },
  { n: 5, text: 'Farmer reviews applicants → WorkerProfileCard → Accept', actor: 'farmer',   label: '👨‍🌾 Farmer'  },
  { n: 6, text: 'Farmer pays → Razorpay Escrow → Worker sees ✅ Secured', actor: 'farmer',   label: '👨‍🌾 Farmer'  },
  { n: 7, text: 'Workers attend farm, mark Day 1/2/3 in app',            actor: 'worker',   label: '👷 Worker'   },
  { n: 8, text: 'Farmer confirms → Escrow releases → UPI payout (95%)',  actor: 'farmer',   label: '👨‍🌾 Farmer'  },
];

const EQUIP_STEPS = [
  { n: 1, text: 'Owner lists equipment — type, rate, districts, cert',    actor: 'owner',   label: '🚁 Owner'    },
  { n: 2, text: 'Farmer searches — type, district, date, price filter',   actor: 'farmer',  label: '👨‍🌾 Farmer'  },
  { n: 3, text: 'Farmer selects slot + hours → live price shown',         actor: 'farmer',  label: '👨‍🌾 Farmer'  },
  { n: 4, text: 'Payment → Escrow. Owner notified, accepts in 2 hours',  actor: 'platform',label: '🏛️ Platform'  },
  { n: 5, text: 'Owner brings equipment to farm, work done',              actor: 'owner',   label: '🚁 Owner'    },
  { n: 6, text: 'Farmer marks "Service Received" → payout to owner 85%', actor: 'farmer',  label: '👨‍🌾 Farmer'  },
];

const ACTOR_CLS = { farmer: 'farmer', worker: 'worker', platform: 'platform', owner: 'owner' };

export default function SystemOverview() {
  return (
    <div className="so-wrap anim-page">

      {/* ── Hero ── */}
      <div className="so-hero">
        <div className="so-hero-tag">KrishiMitra — System Architecture</div>
        <h1 className="so-hero-title">🌿 Complete Flow — दोनों सिस्टम</h1>
        <p className="so-hero-sub">Worker Hiring (Labour Network) + Equipment Rental (RaaS) — सभी Users, Connections &amp; Payments</p>
        <div className="so-hero-stats">
          <div>
            <div className="so-hero-stat-val">2</div>
            <div className="so-hero-stat-lbl">Marketplace Systems</div>
          </div>
          <div>
            <div className="so-hero-stat-val">6</div>
            <div className="so-hero-stat-lbl">User Types</div>
          </div>
          <div>
            <div className="so-hero-stat-val">Escrow</div>
            <div className="so-hero-stat-lbl">Payment Protection</div>
          </div>
          <div>
            <div className="so-hero-stat-val">5% / 15%</div>
            <div className="so-hero-stat-lbl">Platform Fees</div>
          </div>
        </div>
      </div>

      {/* ── Two-System panels ── */}
      <div className="so-systems">

        {/* ── System 1 — Labour Network ── */}
        <div className="so-panel">
          <div className="so-panel-header labour">
            <div className="so-panel-tag">System 1 — Uber for Agriculture</div>
            <div className="so-panel-title">👷 Worker Hiring — Labour Network</div>
            <div className="so-panel-sub">Two-sided marketplace: Farmer posts job → Worker applies → Escrow payment protection</div>
          </div>

          {/* Actors */}
          <div className="so-actors">
            {[
              { icon: '👨‍🌾', role: 'Farmer', desc: 'Posts job, pays, confirms work' },
              { icon: '👷',  role: 'Worker', desc: 'Applies, works, gets paid (95%)' },
              { icon: '🏛️', role: 'Platform',desc: 'Matches, escrow, 5% fee' },
            ].map(a => (
              <div key={a.role} className="so-actor">
                <div className="so-actor-icon">{a.icon}</div>
                <div className="so-actor-role">{a.role}</div>
                <div className="so-actor-desc">{a.desc}</div>
              </div>
            ))}
          </div>

          {/* Flow */}
          <div className="so-flow">
            <div className="so-flow-title">8-Step Flow</div>
            <div className="so-flow-steps">
              {LABOUR_STEPS.map(s => (
                <div key={s.n} className="so-flow-step">
                  <div className="so-flow-step-num">{s.n}</div>
                  <div className="so-flow-step-text">{s.text}</div>
                  <span className={`so-flow-step-actor ${ACTOR_CLS[s.actor]}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="so-payment">
            <div className="so-payment-title">💰 Payment Breakdown — 12 workers × 3 days × ₹500/day</div>
            <table className="so-payment-table">
              <tbody>
                <tr><td>12 × 3 days × ₹500</td><td>₹18,000</td></tr>
                <tr className="platform-row"><td>Platform fee (5%)</td><td>+ ₹900</td></tr>
                <tr className="total-row"><td>Farmer pays total</td><td>₹18,900</td></tr>
                <tr className="highlight"><td>Each worker gets / day (95%)</td><td>₹475</td></tr>
                <tr className="highlight"><td>All 12 workers total (3 days)</td><td>₹17,100</td></tr>
              </tbody>
            </table>
            <div className="so-fee-badge labour">✅ Platform earns: ₹900 (5%)</div>
          </div>
        </div>

        {/* ── System 2 — Equipment RaaS ── */}
        <div className="so-panel">
          <div className="so-panel-header equipment">
            <div className="so-panel-tag">System 2 — Robot as a Service (RaaS)</div>
            <div className="so-panel-title">🚁 Equipment Rental — RaaS</div>
            <div className="so-panel-sub">Owner lists drone/tractor → Farmer finds, books, rents → No ownership needed</div>
          </div>

          {/* Actors */}
          <div className="so-actors">
            {[
              { icon: '👨‍🌾', role: 'Farmer',         desc: 'Searches, books, rents by hour' },
              { icon: '🚁',  role: 'Equipment Owner', desc: 'Lists gear, accepts bookings (85%)' },
              { icon: '🏛️', role: 'Platform',         desc: 'Connects, verifies, 15% fee' },
            ].map(a => (
              <div key={a.role} className="so-actor">
                <div className="so-actor-icon">{a.icon}</div>
                <div className="so-actor-role">{a.role}</div>
                <div className="so-actor-desc">{a.desc}</div>
              </div>
            ))}
          </div>

          {/* Flow */}
          <div className="so-flow">
            <div className="so-flow-title">6-Step Flow</div>
            <div className="so-flow-steps">
              {EQUIP_STEPS.map(s => (
                <div key={s.n} className="so-flow-step">
                  <div className={`so-flow-step-num blue`}>{s.n}</div>
                  <div className="so-flow-step-text">{s.text}</div>
                  <span className={`so-flow-step-actor ${ACTOR_CLS[s.actor]}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="so-payment">
            <div className="so-payment-title">💰 Payment Breakdown — Drone, 3 hours @ ₹280/hr</div>
            <table className="so-payment-table">
              <tbody>
                <tr><td>3 hrs × ₹280/hr (base)</td><td>₹840</td></tr>
                <tr className="platform-row"><td>Platform commission (15%)</td><td>₹126</td></tr>
                <tr className="platform-row"><td>Farmer convenience fee</td><td>+ ₹126</td></tr>
                <tr className="total-row"><td>Farmer pays total</td><td>₹966</td></tr>
                <tr className="highlight"><td>Equipment owner gets (85%)</td><td>₹714</td></tr>
              </tbody>
            </table>
            <div className="so-fee-badge equipment">✅ Platform earns: ₹252 (15%+conv)</div>

            <div style={{ marginTop: 12, padding: '10px', background: '#EFF6FF', borderRadius: 8, fontSize: 11, color: '#1E40AF' }}>
              <strong>vs. buying a drone outright:</strong> ₹4,50,000 → just ₹966 per use
            </div>
          </div>
        </div>
      </div>

      {/* ── Where do Equipment Owners come from? ── */}
      <div className="so-sources">
        <div className="so-sources-title">🏭 Where do Equipment Owners come from?</div>
        <div className="so-sources-sub">KrishiMitra aggregates idle equipment across multiple owner segments</div>
        <div className="so-sources-grid">
          {[
            { icon: '🎓', label: 'ITI / Agriculture College Students', desc: 'Certified drone pilots from ITI programmes. They have the equipment, we give them customers.' },
            { icon: '👨‍🌾', label: 'Progressive Farmers with Equipment', desc: 'Farmers who already own tractors/drones. Idle 70% of time. Krishi Mitra monetises that idle time.' },
            { icon: '🏭', label: 'Agri-Equipment Companies', desc: 'Mahindra Tractors, Garuda Drones — B2B fleet listing on platform.' },
            { icon: '🛠️', label: 'MNREGA Workers with Tools', desc: 'Govt-registered workers who own sprayers, tillers, small equipment. New income source.' },
            { icon: '🏛️', label: 'KVK Partner Networks', desc: 'KVK centres + Pusa Krishi partnership. Demonstration equipment listed for community rental.' },
            { icon: '🚁', label: 'Platform-Owned Fleet (Future)', desc: 'Once revenue starts, platform invests in own drones — rented at premium with guaranteed service.' },
          ].map(s => (
            <div key={s.label} className="so-source-card">
              <div className="so-source-icon">{s.icon}</div>
              <div className="so-source-label">{s.label}</div>
              <div className="so-source-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comparison Table ── */}
      <div className="so-compare">
        <div className="so-compare-title">⚖️ Labour Network vs Equipment Rental — Key Differences</div>
        <table className="so-compare-table">
          <thead>
            <tr>
              <th>Dimension</th>
              <th>👷 Labour Network</th>
              <th>🚁 Equipment RaaS</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['What is rented?',      'A PERSON (worker)',                      'An ASSET (equipment)'],
              ['Identity verification','Aadhaar verified badge',                 'DGCA cert for drones'],
              ['Payment unit',         'Per day worked',                         'Per hour used'],
              ['Platform fee',         '5%',                                     '15% + convenience fee'],
              ['Dispute reason',       'Did worker actually do the work?',       'Did equipment work properly?'],
              ['Matching logic',       'Skill + GPS + rate + availability',      'Type + district + date + price'],
              ['Auto-release trigger', 'Farmer clicks "Confirm Work Done"',      '4 hours after session end'],
              ['Rating builds on',     'Human reliability + job count',          'Equipment + owner service quality'],
            ].map(([dim, lab, equip]) => (
              <tr key={dim}>
                <td style={{ fontWeight: 600, color: 'var(--text-900)' }}>{dim}</td>
                <td>{lab}</td>
                <td>{equip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Hackathon Note ── */}
      <div className="so-hackathon">
        <div className="so-hackathon-title">🏆 Hackathon Demo — What's Live</div>
        <ul className="so-hackathon-list">
          <li>✅ Equipment listing form + search/filter UI + booking slot picker — live demo</li>
          <li>✅ Labour: post job → AI match → apply → accept → escrow → attendance → payout</li>
          <li>✅ Worker dashboard with "Payment Secured ✅" banner and day-by-day attendance marking</li>
          <li>✅ Owner dashboard with 2-hour accept/decline window for incoming bookings</li>
          <li>🟡 Actual Razorpay payment backend — showing "Payment Secured (Mock)" badge</li>
          <li>🟡 Real Firebase FCM — using Firestore listeners for real-time updates</li>
        </ul>
      </div>
    </div>
  );
}
