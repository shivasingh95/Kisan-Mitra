// src/components/Labour/LabourFlowStepper.jsx
// Animated 8-step flow for the Labour Network (System 1) — hackathon demo component
import React, { useState } from 'react';
import './LabourFlowStepper.css';

const ACTORS = [
  {
    role: 'farmer',
    icon: '👨‍🌾',
    label: 'Farmer',
    labelHi: 'किसान',
    action: 'Posts job, pays, confirms',
    fee: 'Pays total + 5%',
  },
  {
    role: 'worker',
    icon: '👷',
    label: 'Worker',
    labelHi: 'श्रमिक',
    action: 'Applies, works, gets paid',
    fee: 'Receives 95% of daily rate',
  },
  {
    role: 'platform',
    icon: '🏛️',
    label: 'Platform',
    labelHi: 'प्लेटफ़ॉर्म',
    action: 'Matches, escrow, verifies',
    fee: '5% fee',
  },
];

const STEPS = [
  {
    icon: '📝',
    title: 'Worker Registration',
    titleHi: 'श्रमिक पंजीकरण',
    actor: 'worker',
    actorLabel: '👷 Worker',
    desc: 'Worker registers via Phone OTP. Fills name, village, district. Selects skills (harvesting, spraying, drone, tractor). Sets daily rate. Uploads Aadhaar for verification badge. Links UPI ID for payments. GPS auto-detects location.',
    tech: ['Firebase Phone Auth', 'Aadhaar verified badge', 'Firestore: workers collection'],
  },
  {
    icon: '📋',
    title: 'Farmer Posts a Job',
    titleHi: 'किसान काम पोस्ट करता है',
    actor: 'farmer',
    actorLabel: '👨‍🌾 Farmer',
    desc: 'Farmer opens "Hire Labour" tab. Fills: crop type (cotton), job type (harvesting), workers needed (12), start date, end date, daily rate offered (₹500/day), location (auto GPS). Platform calculates total budget live.',
    tech: ['jobPostings collection', 'status: "open"', 'Live cost calculator'],
    hasPaymentBox: true,
    paymentData: {
      rows: [
        { label: '12 workers × 3 days × ₹500', value: '₹18,000' },
        { label: 'Platform Fee (5%)',            value: '+ ₹900' },
      ],
      total: { label: 'Farmer Pays Total', value: '₹18,900' },
    },
  },
  {
    icon: '🤖',
    title: 'AI Matching Algorithm Runs',
    titleHi: 'AI मिलान एल्गोरिदम',
    actor: 'platform',
    actorLabel: '🏛️ Platform',
    desc: 'Platform filters all workers by: skill match, 50km GPS radius, available dates overlap, daily rate ≤ offered. Workers ranked by rating + total jobs + distance. Top matches notified via SMS + push notification.',
    tech: ['labourMatching.js', 'Firebase FCM', 'MSG91 SMS', '50km geo-filter'],
  },
  {
    icon: '📩',
    title: 'Worker Sees Job & Applies',
    titleHi: 'श्रमिक आवेदन करता है',
    actor: 'worker',
    actorLabel: '👷 Worker',
    desc: 'Worker gets notification: "New job: Cotton harvesting, Anand district, ₹500/day, 3 days." Opens app — sees job details, farm location on map, farmer\'s rating. Clicks "Apply Now" — one button. Profile auto-sends. Button grays out if already applied.',
    tech: ['Real-time Firestore listener', 'applicants[] array updated', 'FCM push notification'],
  },
  {
    icon: '✅',
    title: 'Farmer Reviews & Accepts Applicants',
    titleHi: 'किसान आवेदनों की समीक्षा करता है',
    actor: 'farmer',
    actorLabel: '👨‍🌾 Farmer',
    desc: 'Farmer\'s "My Hirings" tab shows all applicants with WorkerProfileCard — photo, name, rating (4.8★), total jobs (47), skills, group size. Farmer reviews and taps Accept/Reject. When 12 workers accepted — job status updates to "filled". Accepted workers get confirmation SMS.',
    tech: ['status: "filled"', 'WorkerProfileCard', 'acceptedWorkers[] updated'],
  },
  {
    icon: '🔒',
    title: 'Farmer Holds Payment in Escrow',
    titleHi: 'एस्क्रो भुगतान',
    actor: 'farmer',
    actorLabel: '👨‍🌾 Farmer',
    desc: '"Confirm Payment Hold" button appears. Farmer pays total ₹18,900 — goes into Razorpay escrow account. Workers can now see "Payment Secured ✅" status in their app. This gives workers 100% confidence — paisa hai, koi risk nahi. Job status → "in_progress".',
    tech: ['Razorpay escrow', 'escrowHeld: true', 'transactions collection created'],
    hasEscrowBadge: true,
  },
  {
    icon: '🌾',
    title: 'Work Happens + Attendance Marked',
    titleHi: 'काम + उपस्थिति',
    actor: 'both',
    actorLabel: '👷+👨‍🌾 Both',
    desc: 'Workers go to the farm. Each day they mark attendance in app — "Day 1 Done ✓". Farmer can see real-time attendance status. If worker doesn\'t show up → dispute can be raised. Worker with no-show gets account warning. Both sides have full visibility.',
    tech: ['Daily attendance in Firestore', 'GPS verification optional', 'Dispute system'],
  },
  {
    icon: '💸',
    title: 'Farmer Confirms → Payment Released',
    titleHi: 'काम पुष्टि → भुगतान जारी',
    actor: 'farmer',
    actorLabel: '👨‍🌾 Farmer',
    desc: '"Confirm Work Done" button. Farmer clicks → escrow releases automatically. Each worker gets ₹475/day (₹500 × 95% — platform takes 5%) directly into their UPI account. Transaction records created. Worker\'s totalJobs increments. Both get "Rate each other" prompt.',
    tech: ['Auto UPI payout', 'Platform fee: 5% = ₹900', 'totalJobs++ for worker'],
    hasPaymentBox: true,
    paymentData: {
      rows: [
        { label: 'Farmer paid total',              value: '₹18,900' },
        { label: 'Platform fee (5%)',              value: '₹900' },
        { label: 'Each worker gets / day (95%)',   value: '₹475/day', highlight: true },
        { label: '12 workers × 3 days payout',    value: '₹17,100 total', highlight: true },
      ],
      total: { label: 'Platform Revenue', value: '₹900' },
    },
  },
];

const ACTOR_BADGE_CLASS = {
  farmer:   'lfs-badge-farmer',
  worker:   'lfs-badge-worker',
  platform: 'lfs-badge-platform',
  both:     'lfs-badge-both',
};

export default function LabourFlowStepper() {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <div className="lfs-wrap">
      {/* Header */}
      <div className="lfs-header">
        <div className="lfs-header-label">System 1 — Labour Network</div>
        <h2 className="lfs-header-title">👷 Worker Hiring — Complete Flow</h2>
        <p className="lfs-header-sub">Uber-style दो-तरफा बाज़ार — Farmer से Worker तक, Escrow सुरक्षा के साथ</p>
      </div>

      {/* Actors */}
      <div className="lfs-actors">
        {ACTORS.map((actor, i) => (
          <React.Fragment key={actor.role}>
            <div className={`lfs-actor-card ${actor.role}`}>
              <div className="lfs-actor-icon">{actor.icon}</div>
              <div className="lfs-actor-role">{actor.label} — <span style={{ fontFamily: 'var(--font-hindi)' }}>{actor.labelHi}</span></div>
              <div className="lfs-actor-action">{actor.action}</div>
              <span className="lfs-actor-fee">{actor.fee}</span>
            </div>
            {i < ACTORS.length - 1 && (
              <div className="lfs-actors-arrow">↔</div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 8 steps */}
      <div className="lfs-steps">
        {STEPS.map((step, i) => {
          const isActive    = activeStep === i;
          const isCompleted = activeStep !== null && i < activeStep;
          const stateClass  = isCompleted ? 'completed' : isActive ? 'active' : 'upcoming';

          return (
            <div key={i} className="lfs-step" onClick={() => setActiveStep(isActive ? null : i)}>
              {/* Left: number bubble */}
              <div className="lfs-step-left">
                <div className={`lfs-step-num ${stateClass}`}>
                  {isCompleted ? '✓' : step.icon}
                </div>
              </div>

              {/* Body */}
              <div className={`lfs-step-body ${stateClass}`}>
                <div className="lfs-step-top">
                  <div className="lfs-step-title">
                    Step {i + 1}: {step.title}
                    <span className="lfs-step-hi"> — {step.titleHi}</span>
                  </div>
                  <span className={`lfs-step-actor-badge ${ACTOR_BADGE_CLASS[step.actor]}`}>
                    {step.actorLabel}
                  </span>
                </div>

                {/* Always show description when active */}
                {isActive && (
                  <>
                    <div className="lfs-step-desc">{step.desc}</div>

                    {/* Tech chips */}
                    <div className="lfs-step-tech">
                      {step.tech.map(t => (
                        <span key={t} className="lfs-tech-chip">{t}</span>
                      ))}
                    </div>

                    {/* Payment box */}
                    {step.hasPaymentBox && step.paymentData && (
                      <div className="lfs-payment-box">
                        <div className="lfs-payment-box-title">💰 Payment Breakdown</div>
                        <div className="lfs-payment-rows">
                          {step.paymentData.rows.map((r, ri) => (
                            <div key={ri} className={`lfs-payment-row ${r.highlight ? 'highlight' : ''}`}>
                              <span>{r.label}</span>
                              <strong>{r.value}</strong>
                            </div>
                          ))}
                          {step.paymentData.total && (
                            <div className="lfs-payment-row total">
                              <span>{step.paymentData.total.label}</span>
                              <strong>{step.paymentData.total.value}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Escrow badge */}
                    {step.hasEscrowBadge && (
                      <div className="lfs-escrow-badge">
                        🔒 Payment Secured (Mock) — Workers see "Escrow Held ✅"
                      </div>
                    )}
                  </>
                )}

                {/* Collapsed: show small desc */}
                {!isActive && (
                  <div className="lfs-step-desc" style={{ fontSize: 12, marginBottom: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {step.desc}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment summary breakdown */}
      <div className="lfs-breakdown">
        <div className="lfs-breakdown-title">
          💰 Payment Breakdown — Example: 12 workers × 3 days × ₹500/day
        </div>
        <div className="lfs-breakdown-grid">
          <div className="lfs-breakdown-cell">
            <div className="lfs-breakdown-val">₹18,900</div>
            <div className="lfs-breakdown-lbl">Farmer pays total<br/>(incl. 5% fee)</div>
          </div>
          <div className="lfs-breakdown-cell fee">
            <div className="lfs-breakdown-val">₹900</div>
            <div className="lfs-breakdown-lbl">Platform fee<br/>(5%)</div>
          </div>
          <div className="lfs-breakdown-cell worker">
            <div className="lfs-breakdown-val">₹475</div>
            <div className="lfs-breakdown-lbl">Each worker gets<br/>per day (95%)</div>
          </div>
          <div className="lfs-breakdown-cell worker">
            <div className="lfs-breakdown-val">₹17,100</div>
            <div className="lfs-breakdown-lbl">All 12 workers<br/>get (3 days total)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
