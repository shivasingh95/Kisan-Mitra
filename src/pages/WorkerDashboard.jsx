// src/pages/WorkerDashboard.jsx — Worker portal with 3 tabs
import React, { useState, useEffect, useCallback } from 'react';
import './WorkerDashboard.css';
import { useApp } from '../context/AppContext.jsx';
import { getAllOpenJobs, applyToJob, getWorkerTransactions, getWorkerByUid } from '../services/db';
import { MOCK_JOBS, MOCK_WORKERS, getSkill } from '../data/mockWorkers';

const TABS = [
  { id: 'jobs',         label: 'Available Jobs',    labelHi: 'उपलब्ध काम',      icon: '🔍' },
  { id: 'applications', label: 'My Applications',   labelHi: 'मेरे आवेदन',      icon: '📋' },
  { id: 'earnings',     label: 'Earnings',          labelHi: 'कमाई',            icon: '💰' },
];

const STATUS_BADGES = {
  pending:  { label: '🟡 Pending',  cls: 'wd-badge-pending'  },
  accepted: { label: '✅ Accepted', cls: 'wd-badge-accepted' },
  rejected: { label: '❌ Rejected', cls: 'wd-badge-rejected' },
};

export default function WorkerDashboard() {
  const { currentUser, firebaseUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [applied, setApplied] = useState({}); // jobId → status
  const [loading, setLoading] = useState(true);
  const [applyingJob, setApplyingJob] = useState(null);

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
          {myApplications.length === 0 && Object.keys(applied).length === 0 ? (
            <div className="card wd-empty">
              <span style={{ fontSize: '2.5rem' }}>📋</span>
              <p>You haven't applied to any jobs yet.</p>
              <span className="hindi">आपने अभी किसी काम के लिए आवेदन नहीं किया है।</span>
            </div>
          ) : (
            <>
              {/* Show locally applied jobs */}
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
