// src/pages/WorkerDashboard.jsx — Worker portal with 3 tabs + attendance + escrow
import React, { useState, useEffect, useCallback } from 'react';
import './WorkerDashboard.css';
import { useApp } from '@/context/AppContext';
import { getAllOpenJobs, applyToJob, getWorkerTransactions, getWorkerByUid } from '@/services/firebase/firestore.service';
import { MOCK_JOBS, MOCK_WORKERS, getSkill } from '../data/mockWorkers';

const TABS = [
  { id: 'jobs',         label: 'Available Jobs',    labelHi: 'उपलब्ध काम',      icon: '🔍' },
  { id: 'applications', label: 'My Applications',   labelHi: 'मेरे आवेदन',      icon: '📋' },
  { id: 'earnings',     label: 'Earnings',          labelHi: 'कमाई',            icon: '💰' },
];

const STATUS_BADGES = {
  pending:  { label: '🟡 Pending',   cls: 'wd-badge-pending'  },
  accepted: { label: '✅ Accepted',  cls: 'wd-badge-accepted' },
  rejected: { label: '❌ Rejected',  cls: 'wd-badge-rejected' },
};

// Mock accepted job for demo (shows escrow + attendance flow)
const MOCK_ACCEPTED_JOB = {
  jobId: 'jacc001', id: 'jacc001',
  farmerName: 'Ramesh Patidar', farmerPhone: '+91 98765 43210',
  cropType: 'cotton', jobType: 'harvesting',
  workersNeeded: 12,
  location: { village: 'Khargone', district: 'Khandwa' },
  startDate: new Date('2026-06-05').getTime(),
  endDate:   new Date('2026-06-07').getTime(),
  durationDays: 3,
  dailyRateOffered: 500,
  escrowHeld: true,
  escrowAmount: 18900,
  status: 'in_progress',
  applicants: [],
};

export default function WorkerDashboard() {
  const { currentUser, firebaseUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [applied, setApplied]         = useState({}); // jobId → status
  const [loading, setLoading]         = useState(true);
  const [applyingJob, setApplyingJob] = useState(null);
  const [attendance, setAttendance]   = useState({}); // jobId_day → true/false

  const uid = firebaseUser?.uid || currentUser?.id || 'demo_worker';
  // Use demo worker w005 as the mock profile
  const mockWorker = MOCK_WORKERS.find(w => w.workerId === 'w005') || MOCK_WORKERS[0];

  // ── Load data ──────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load worker profile
      const profile = await getWorkerByUid(uid).catch(() => null);
      setWorkerProfile(profile || mockWorker);

      // Load jobs (fallback to mock)
      const jobsData = await getAllOpenJobs().catch(() => []);
      setJobs(jobsData.length > 0 ? jobsData : MOCK_JOBS);

      // Load transactions
      const workerId = profile?.workerId || mockWorker.workerId;
      const txns = await getWorkerTransactions(workerId).catch(() => []);
      setTransactions(txns);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Apply to job ───────────────────────────────────────────
  const handleApply = async (job) => {
    const workerId = workerProfile?.workerId || mockWorker.workerId;
    const alreadyApplied = (job.applicants || []).some(a => a.workerId === workerId);
    if (alreadyApplied || applied[job.id || job.jobId]) {
      showToast('Already applied to this job', 'info');
      return;
    }
    setApplyingJob(job.id || job.jobId);
    try {
      if (job.id) {
        await applyToJob(job.id, workerId);
      }
      setApplied(prev => ({ ...prev, [job.id || job.jobId]: 'pending' }));
      showToast('✅ Application sent!', 'success');
    } catch {
      showToast('Failed to apply. Try again.', 'error');
    } finally {
      setApplyingJob(null);
    }
  };

  // ── Derived data ───────────────────────────────────────────
  const myApplications = jobs.filter(j => {
    const wid = workerProfile?.workerId || mockWorker.workerId;
    return (j.applicants || []).some(a => a.workerId === wid) || applied[j.id || j.jobId];
  });

  const totalEarned  = transactions.filter(t => t.status === 'released').reduce((s, t) => s + (t.workerReceives || 0), 0);
  const totalPending = transactions.filter(t => t.status === 'held').reduce((s, t) => s + (t.workerReceives || 0), 0);

  if (loading) {
    return (
      <div className="wd-loading anim-page">
        <div className="wd-spinner" />
        <p>Loading worker dashboard…</p>
      </div>
    );
  }

  return (
    <div className="wd-wrap anim-page">
      {/* Worker profile hero */}
      <div className="wd-hero card">
        <div className="wd-hero-avatar">
          {(workerProfile?.name || 'W').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="wd-hero-info">
          <h1 className="wd-hero-name">{workerProfile?.name || mockWorker.name}</h1>
          <p className="hindi wd-hero-subname">{workerProfile?.nameHindi || mockWorker.nameHindi}</p>
          <div className="wd-hero-meta">
            📍 {workerProfile?.village || mockWorker.village}, {workerProfile?.district || mockWorker.district}
            &nbsp;·&nbsp; ₹{workerProfile?.dailyRate || mockWorker.dailyRate}/day
            &nbsp;·&nbsp; ⭐ {(workerProfile?.rating || mockWorker.rating).toFixed(1)}
          </div>
          <div className="wd-hero-skills">
            {(workerProfile?.skills || mockWorker.skills).map(id => {
              const s = getSkill(id);
              return <span key={id} className="wd-skill-pill">{s.icon} {s.label}</span>;
            })}
          </div>
        </div>
        {(workerProfile?.aadhaarVerified ?? mockWorker.aadhaarVerified) ? (
          <span className="wd-verified">✓ Aadhaar<br/>Verified</span>
        ) : (
          <span className="wd-unverified">⏳ Pending<br/>Verification</span>
        )}
      </div>

      {/* Tab bar */}
      <div className="pill-group" style={{ marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} className={`pill ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
            <span className="hindi" style={{ fontSize: 11, marginLeft: 4, opacity: 0.8 }}>{t.labelHi}</span>
          </button>
        ))}
      </div>

      {/* ════════ AVAILABLE JOBS ════════ */}
      {activeTab === 'jobs' && (
        <div className="wd-jobs">
          {jobs.length === 0 ? (
            <div className="card wd-empty">
              <span style={{ fontSize: '2.5rem' }}>🔍</span>
              <p>No jobs available in your area right now.</p>
              <span className="hindi">अभी आपके क्षेत्र में कोई काम उपलब्ध नहीं है।</span>
            </div>
          ) : jobs.map((job, i) => {
            const skill = getSkill(job.jobType);
            const wid = workerProfile?.workerId || mockWorker.workerId;
            const alreadyApplied = (job.applicants || []).some(a => a.workerId === wid) || applied[job.id || job.jobId];
            const durationDays = job.durationDays || Math.ceil(((job.endDate || 0) - (job.startDate || 0)) / 86400000);
            return (
              <div key={job.id || job.jobId} className={`card card-3d wd-job-card anim-fadeup delay-${i % 4 + 1}`}>
                <div className="wd-job-top">
                  <div className="wd-job-icon">{skill.icon}</div>
                  <div className="wd-job-info">
                    <div className="wd-job-title">
                      {skill.label} <span className="hindi wd-job-title-hi">— {skill.hindi}</span>
                    </div>
                    <div className="wd-job-farmer">by {job.farmerName} · 🌾 {job.cropType}</div>
                    <div className="wd-job-meta">
                      📍 {job.location?.village ? `${job.location.village}, ` : ''}{job.location?.district}
                      &nbsp;·&nbsp; 📅 {job.startDate ? new Date(job.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </div>
                  </div>
                  <div className="wd-job-rate">
                    <span className="wd-job-rate-val">₹{job.dailyRateOffered}</span>
                    <span className="wd-job-rate-lbl">per day</span>
                    <span className="wd-job-duration">{durationDays} days</span>
                  </div>
                </div>
                <div className="wd-job-footer">
                  <span className="wd-job-workers">👥 {job.workersNeeded} workers needed</span>
                  <span className="wd-job-total">Total: ₹{(job.dailyRateOffered * durationDays).toLocaleString('en-IN')}</span>
                  <button
                    className={`btn btn-sm ${alreadyApplied ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={() => handleApply(job)}
                    disabled={alreadyApplied || applyingJob === (job.id || job.jobId)}
                  >
                    {applyingJob === (job.id || job.jobId) ? '⏳' : alreadyApplied ? '✓ Applied' : '📩 Apply Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════ MY APPLICATIONS ════════ */}
      {activeTab === 'applications' && (
        <div className="wd-applications">

          {/* ── Mock accepted job showing full escrow + attendance flow ── */}
          <div className="card wd-app-card" style={{ border: '2px solid #10B981', marginBottom: 16 }}>
            {/* Escrow secured banner */}
            <div style={{
              background: 'linear-gradient(135deg, #065F46, #10B981)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 14, color: '#fff',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 22 }}>🔒</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Payment Secured ✅</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>
                  ₹{MOCK_ACCEPTED_JOB.escrowAmount?.toLocaleString('en-IN')} held in Razorpay Escrow — Paisa safe hai!
                </div>
              </div>
            </div>

            <div className="wd-app-top" style={{ marginBottom: 12 }}>
              <span className="wd-app-icon">{getSkill(MOCK_ACCEPTED_JOB.jobType).icon}</span>
              <div className="wd-app-info">
                <div className="wd-app-title">
                  {getSkill(MOCK_ACCEPTED_JOB.jobType).label} — {MOCK_ACCEPTED_JOB.farmerName}
                </div>
                <div className="wd-app-meta">
                  📍 {MOCK_ACCEPTED_JOB.location?.village}, {MOCK_ACCEPTED_JOB.location?.district}
                  &nbsp;·&nbsp; 🌾 {MOCK_ACCEPTED_JOB.cropType}
                  &nbsp;·&nbsp; ₹{MOCK_ACCEPTED_JOB.dailyRateOffered}/day
                </div>
                <div className="wd-app-meta" style={{ marginTop: 4 }}>
                  📅 5 Jun – 7 Jun 2026 &nbsp;·&nbsp; 3 days &nbsp;·&nbsp; 👥 12 workers
                </div>
              </div>
              <span className="wd-app-badge wd-badge-accepted">✅ Accepted</span>
            </div>

            {/* Farmer contact */}
            <div className="wd-app-contact" style={{ marginBottom: 14 }}>
              📞 Farmer: {MOCK_ACCEPTED_JOB.farmerPhone}
              <span style={{ marginLeft: 12, color: 'var(--text-muted)', fontSize: 12 }}>
                (shared after acceptance)
              </span>
            </div>

            {/* Daily Attendance Marking */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Daily Attendance — दैनिक उपस्थिति
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[1, 2, 3].map(day => {
                  const key = `jacc001_day${day}`;
                  const done = attendance[key];
                  return (
                    <button
                      key={day}
                      onClick={() => setAttendance(a => ({ ...a, [key]: !done }))}
                      style={{
                        flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none',
                        cursor: 'pointer', fontWeight: 700, fontSize: 'var(--text-xs)',
                        transition: 'all 0.2s',
                        background: done
                          ? 'linear-gradient(135deg, #065F46, #10B981)'
                          : 'var(--bg-main)',
                        color: done ? '#fff' : 'var(--text-muted)',
                        boxShadow: done ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                      }}
                    >
                      {done ? '✓' : '○'} Day {day}
                      <div style={{ fontSize: 10, marginTop: 2, opacity: 0.8 }}>
                        {done ? 'Marked Done' : 'Mark Done'}
                      </div>
                    </button>
                  );
                })}
              </div>
              {Object.values({
                d1: attendance['jacc001_day1'],
                d2: attendance['jacc001_day2'],
                d3: attendance['jacc001_day3'],
              }).filter(Boolean).length === 3 && (
                <div style={{
                  marginTop: 10, background: '#F0FDF4', border: '1px solid #BBF7D0',
                  borderRadius: 8, padding: '8px 12px', fontSize: 12,
                  color: '#15803D', fontWeight: 600,
                }}>
                  🎉 All 3 days marked! Waiting for farmer to confirm work done.
                  <span style={{ fontFamily: 'var(--font-hindi)', marginLeft: 6, fontWeight: 400 }}>
                    किसान की पुष्टि का इंतज़ार…
                  </span>
                </div>
              )}
            </div>

            {/* Expected payout */}
            <div style={{
              background: 'var(--bg-main)', borderRadius: 10, padding: '12px 14px', marginTop: 4,
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                💰 Expected Payout
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--primary)' }}>₹475</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>per day (95%)</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--primary)' }}>₹1,425</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>total (3 days)</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: '#7C3AED', fontWeight: 600 }}>→ Direct UPI payout</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>after farmer confirms</div>
                </div>
              </div>
            </div>
          </div>

          {myApplications.length === 0 && Object.keys(applied).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: 13 }}>
              Apply to jobs to see them here.
            </div>
          ) : (
            <>
              {Object.entries(applied).map(([jobId, status]) => {
                const job = jobs.find(j => (j.id || j.jobId) === jobId);
                if (!job) return null;
                const skill = getSkill(job.jobType);
                const badge = STATUS_BADGES[status] || STATUS_BADGES.pending;
                return (
                  <div key={jobId} className="card wd-app-card">
                    <div className="wd-app-top">
                      <span className="wd-app-icon">{skill.icon}</span>
                      <div className="wd-app-info">
                        <div className="wd-app-title">{skill.label} — {job.farmerName}</div>
                        <div className="wd-app-meta">📍 {job.location?.district} · ₹{job.dailyRateOffered}/day</div>
                      </div>
                      <span className={`wd-app-badge ${badge.cls}`}>{badge.label}</span>
                    </div>
                    {status === 'accepted' && job.farmerPhone && (
                      <div className="wd-app-contact">📞 Farmer: {job.farmerPhone}</div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ════════ EARNINGS ════════ */}
      {activeTab === 'earnings' && (
        <div className="wd-earnings">
          <div className="wd-earnings-summary">
            <div className="card wd-earn-card wd-earn-total">
              <div className="wd-earn-icon">💰</div>
              <div>
                <div className="wd-earn-val">₹{totalEarned.toLocaleString('en-IN')}</div>
                <div className="wd-earn-lbl">Total Earned<span className="hindi"> — कुल कमाई</span></div>
              </div>
            </div>
            <div className="card wd-earn-card wd-earn-pending">
              <div className="wd-earn-icon">⏳</div>
              <div>
                <div className="wd-earn-val">₹{totalPending.toLocaleString('en-IN')}</div>
                <div className="wd-earn-lbl">Pending<span className="hindi"> — बकाया</span></div>
              </div>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="card wd-empty" style={{ marginTop: 16 }}>
              <span style={{ fontSize: '2.5rem' }}>💸</span>
              <p>No payments yet. Complete a job to earn!</p>
              <span className="hindi">अभी कोई भुगतान नहीं है।</span>
            </div>
          ) : (
            <div className="wd-txn-list">
              {transactions.map(txn => (
                <div key={txn.id} className="card wd-txn-card">
                  <div className="wd-txn-top">
                    <div className="wd-txn-info">
                      <div className="wd-txn-title">Job #{txn.jobId?.slice(-6) || '—'}</div>
                      <div className="wd-txn-date">{txn.releasedAt?.toDate ? txn.releasedAt.toDate().toLocaleDateString('en-IN') : '—'}</div>
                    </div>
                    <div className="wd-txn-amount">
                      <span className="wd-txn-val">₹{(txn.workerReceives || 0).toLocaleString('en-IN')}</span>
                      <span className={`wd-txn-badge ${txn.status === 'released' ? 'wd-badge-paid' : 'wd-badge-pending'}`}>
                        {txn.status === 'released' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="wd-txn-detail">
                    Gross: ₹{txn.amount || 0} — Platform fee: ₹{txn.platformFee || 0} — You received: ₹{txn.workerReceives || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

