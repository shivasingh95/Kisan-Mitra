// src/components/Labour/FarmerHiringPanel.jsx — Manage active job postings & applicants
import React, { useState, useEffect, useCallback } from 'react';
import './FarmerHiringPanel.css';
import { useApp } from '../../context/AppContext.jsx';
import {
  getFarmerJobs,
  acceptApplicant,
  rejectApplicant,
  confirmEscrow,
  completeJob,
  createTransaction,
  createNotification,
  getWorkerProfile,
} from '../../services/db';
import WorkerProfileCard from './WorkerProfileCard.jsx';
import { getSkill } from '../../data/mockWorkers';

const STATUS_BADGE = {
  open:        { label: '🟢 Open',        cls: 'fhp-status-open'        },
  filled:      { label: '🔵 Filled',      cls: 'fhp-status-filled'      },
  in_progress: { label: '🟡 In Progress', cls: 'fhp-status-inprogress'  },
  completed:   { label: '✅ Completed',   cls: 'fhp-status-completed'   },
  cancelled:   { label: '❌ Cancelled',   cls: 'fhp-status-cancelled'   },
};

export default function FarmerHiringPanel() {
  const { currentUser, showToast } = useApp();
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(null);
  const [workerMap, setWorkerMap] = useState({}); // workerId → profile
  const [actionLoading, setActionLoading] = useState({});

  const farmerId = currentUser?.id || currentUser?.uid || 'demo_farmer';

  // ── Load jobs ──────────────────────────────────────────────
  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFarmerJobs(farmerId);
      setJobs(data);
    } catch {
      // Fallback to mock for demo
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  // ── Load worker profiles when a job is expanded ────────────
  useEffect(() => {
    if (!expanded) return;
    const job = jobs.find(j => j.id === expanded);
    if (!job) return;
    const missing = (job.applicants || [])
      .map(a => a.workerId)
      .filter(wid => !workerMap[wid] && !wid.startsWith('mock_'));
    if (!missing.length) return;
    Promise.all(missing.map(wid => getWorkerProfile(wid)
      .then(profile => ({ wid, profile }))
      .catch(() => ({ wid, profile: null }))
    )).then(results => {
      const newMap = {};
      results.forEach(({ wid, profile }) => { newMap[wid] = profile; });
      setWorkerMap(prev => ({ ...prev, ...newMap }));
    });
  }, [expanded, jobs]); // eslint-disable-line

  const setLoading_ = (key, val) =>
    setActionLoading(prev => ({ ...prev, [key]: val }));

  // ── Accept applicant ───────────────────────────────────────
  const handleAccept = async (job, workerId) => {
    const key = `accept_${job.id}_${workerId}`;
    setLoading_(key, true);
    try {
      await acceptApplicant(job.id, workerId);
      await createNotification(workerId, {
        type:  'application_accepted',
        title: 'Your Application was Accepted! ✅',
        body:  `${job.farmerName} has accepted your application for the ${job.jobType} job in ${job.location?.district}.`,
        jobId: job.id,
      });
      showToast('✅ Applicant accepted', 'success');
      await loadJobs();
    } catch {
      showToast('Failed to accept applicant', 'error');
    } finally {
      setLoading_(key, false);
    }
  };

  // ── Reject applicant ───────────────────────────────────────
  const handleReject = async (job, workerId) => {
    const key = `reject_${job.id}_${workerId}`;
    setLoading_(key, true);
    try {
      await rejectApplicant(job.id, workerId);
      showToast('Applicant rejected', 'info');
      await loadJobs();
    } catch {
      showToast('Failed to reject applicant', 'error');
    } finally {
      setLoading_(key, false);
    }
  };

  // ── Confirm escrow (mock payment hold) ─────────────────────
  const handleEscrow = async (job) => {
    const key = `escrow_${job.id}`;
    setLoading_(key, true);
    try {
      await confirmEscrow(job.id, job.totalBudget);
      showToast('💰 Payment secured in escrow!', 'success');
      await loadJobs();
    } catch {
      showToast('Failed to hold payment', 'error');
    } finally {
      setLoading_(key, false);
    }
  };

  // ── Confirm work done & release payment ────────────────────
  const handleComplete = async (job) => {
    const key = `complete_${job.id}`;
    setLoading_(key, true);
    try {
      await completeJob(job.id);
      // Create a transaction per accepted worker
      const workerIds = job.acceptedWorkers || [];
      const perWorker = Math.round((job.totalBudget / (1 + 0.05)) / Math.max(workerIds.length, 1));
      await Promise.all(workerIds.map(async wid => {
        const platformFee    = Math.round(perWorker * 0.05);
        const workerReceives = perWorker - platformFee;
        await createTransaction({
          jobId:          job.id,
          farmerId,
          workerId:       wid,
          amount:         perWorker,
          platformFee,
          workerReceives,
        });
        await createNotification(wid, {
          type:  'payment_released',
          title: '💸 Payment Released!',
          body:  `₹${workerReceives.toLocaleString('en-IN')} has been credited to your UPI for the ${job.jobType} job.`,
          jobId: job.id,
        });
      }));
      showToast('✅ Work confirmed! Payments released to workers.', 'success');
      await loadJobs();
    } catch {
      showToast('Failed to complete job', 'error');
    } finally {
      setLoading_(key, false);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fhp-loading">
        <div className="fhp-spinner" />
        <p>Loading your job postings…</p>
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className="fhp-empty card">
        <div className="fhp-empty-icon">📋</div>
        <h3>No Jobs Posted Yet</h3>
        <p className="hindi">अभी कोई काम पोस्ट नहीं किया गया है।</p>
        <p>Switch to the <strong>"Post a Job"</strong> tab to hire workers.</p>
      </div>
    );
  }

  return (
    <div className="fhp-wrap">
      <div className="fhp-heading">
        <h2 className="fhp-title">📂 My Hirings</h2>
        <p className="hindi fhp-sub">आपकी सक्रिय भर्ती प्रक्रियाएं</p>
      </div>

      <div className="fhp-jobs">
        {jobs.map(job => {
          const sb = STATUS_BADGE[job.status] || STATUS_BADGE.open;
          const isExpanded = expanded === job.id;
          const skill = getSkill(job.jobType);
          const pendingApplicants  = (job.applicants || []).filter(a => a.status === 'pending');
          const acceptedApplicants = (job.applicants || []).filter(a => a.status === 'accepted');

          return (
            <div key={job.id} className="fhp-job-card card card-3d">
              {/* Job header */}
              <div
                className="fhp-job-header"
                onClick={() => setExpanded(isExpanded ? null : job.id)}
              >
                <div className="fhp-job-icon">{skill.icon}</div>
                <div className="fhp-job-info">
                  <div className="fhp-job-name">
                    {skill.label}
                    <span className="hindi fhp-job-hi"> — {skill.hindi}</span>
                  </div>
                  <div className="fhp-job-meta">
                    🌾 {job.cropType} &nbsp;·&nbsp;
                    👥 {job.workersNeeded} needed &nbsp;·&nbsp;
                    📍 {job.location?.district}
                  </div>
                  <div className="fhp-job-meta">
                    📅 {job.startDate ? new Date(job.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    {' '} – {job.endDate ? new Date(job.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    &nbsp;·&nbsp;
                    ₹{job.dailyRateOffered}/day
                  </div>
                </div>
                <div className="fhp-job-right">
                  <span className={`fhp-status-badge ${sb.cls}`}>{sb.label}</span>
                  <span className="fhp-applicant-count">
                    {pendingApplicants.length > 0 && (
                      <span className="fhp-pending-dot">{pendingApplicants.length} new</span>
                    )}
                  </span>
                  <span className="fhp-expand-arrow">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="fhp-expanded">
                  <div className="fhp-divider" />

                  {/* Budget summary */}
                  <div className="fhp-budget-row">
                    <span>Total Budget</span>
                    <strong>₹{(job.totalBudget || 0).toLocaleString('en-IN')}</strong>
                  </div>

                  {/* Escrow / Work Done buttons */}
                  {job.status === 'filled' && !job.escrowHeld && (
                    <button
                      className="btn btn-primary btn-full fhp-action-btn"
                      onClick={() => handleEscrow(job)}
                      disabled={actionLoading[`escrow_${job.id}`]}
                    >
                      {actionLoading[`escrow_${job.id}`] ? '⏳ Processing…' : '🔒 Confirm Payment Hold'}
                    </button>
                  )}
                  {job.escrowHeld && job.status !== 'completed' && (
                    <div className="fhp-escrow-secured">
                      <span>💰 Payment Secured ✅</span>
                      <span>₹{(job.escrowAmount || 0).toLocaleString('en-IN')} held in escrow</span>
                    </div>
                  )}
                  {job.status === 'in_progress' && (
                    <button
                      className="btn btn-secondary btn-full fhp-action-btn"
                      onClick={() => handleComplete(job)}
                      disabled={actionLoading[`complete_${job.id}`]}
                    >
                      {actionLoading[`complete_${job.id}`] ? '⏳ Processing…' : '✅ Confirm Work Done — Payment Released'}
                    </button>
                  )}
                  {job.status === 'completed' && (
                    <div className="fhp-completed-banner">
                      ✅ Job Completed — Payments Released to Workers
                    </div>
                  )}

                  {/* Pending applicants */}
                  {pendingApplicants.length > 0 && (
                    <div className="fhp-applicant-section">
                      <div className="fhp-section-label">
                        🕐 Pending Applications ({pendingApplicants.length})
                        <span className="hindi"> — आवेदन प्रतीक्षारत</span>
                      </div>
                      <div className="fhp-applicant-list">
                        {pendingApplicants.map(app => {
                          const worker = workerMap[app.workerId];
                          return (
                            <WorkerProfileCard
                              key={app.workerId}
                              worker={worker || {
                                workerId:       app.workerId,
                                name:           `Worker ${app.workerId.slice(-4)}`,
                                aadhaarVerified: false,
                                district:       job.location?.district || '',
                                skills:         [job.jobType],
                                rating:         0, totalJobs: 0,
                                dailyRate:      job.dailyRateOffered,
                                groupSize:      1,
                              }}
                              appliedAt={app.appliedAt}
                              appStatus="pending"
                              onAccept={() => handleAccept(job, app.workerId)}
                              onReject={() => handleReject(job, app.workerId)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Accepted workers */}
                  {acceptedApplicants.length > 0 && (
                    <div className="fhp-applicant-section">
                      <div className="fhp-section-label">
                        ✅ Accepted Workers ({acceptedApplicants.length}/{job.workersNeeded})
                        <span className="hindi"> — स्वीकृत श्रमिक</span>
                      </div>
                      <div className="fhp-applicant-list">
                        {acceptedApplicants.map(app => {
                          const worker = workerMap[app.workerId];
                          return (
                            <WorkerProfileCard
                              key={app.workerId}
                              compact
                              worker={worker || {
                                workerId:       app.workerId,
                                name:           `Worker ${app.workerId.slice(-4)}`,
                                aadhaarVerified: false,
                                district:       job.location?.district || '',
                                skills:         [job.jobType],
                                rating:         0, totalJobs: 0,
                                dailyRate:      job.dailyRateOffered,
                                groupSize:      1,
                              }}
                              appStatus="accepted"
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!pendingApplicants.length && !acceptedApplicants.length && (
                    <div className="fhp-no-applicants">
                      No applications yet. Workers will apply soon!
                      <span className="hindi"> श्रमिक जल्द ही आवेदन करेंगे।</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
