// src/components/Labour/WorkerProfileCard.jsx — Reusable worker card for Labour Network
import React from 'react';
import './WorkerProfileCard.css';
import { getSkill } from '../../data/mockWorkers';

/**
 * WorkerProfileCard
 * Props:
 *   worker     {Object}  - worker data object
 *   onAccept   {Function} - optional, shown when passed
 *   onReject   {Function} - optional, shown when passed
 *   compact    {boolean}  - condensed mode for lists
 *   appliedAt  {number}   - timestamp if showing application date
 *   appStatus  {string}   - 'pending'|'accepted'|'rejected'
 */
export default function WorkerProfileCard({
  worker,
  onAccept,
  onReject,
  compact = false,
  appliedAt,
  appStatus,
}) {
  if (!worker) return null;

  const initials = (worker.name || 'W')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const skills = Array.isArray(worker.skills) ? worker.skills : [];

  const statusConfig = {
    pending:  { label: '🟡 Pending',  cls: 'wpc-status-pending'  },
    accepted: { label: '✅ Accepted', cls: 'wpc-status-accepted' },
    rejected: { label: '❌ Rejected', cls: 'wpc-status-rejected' },
  };

  return (
    <div className={`wpc-card card card-3d ${compact ? 'wpc-compact' : ''}`}>
      {/* Header row */}
      <div className="wpc-header">
        <div className="wpc-avatar">{initials}</div>
        <div className="wpc-identity">
          <div className="wpc-name">{worker.name}</div>
          {worker.nameHindi && (
            <div className="wpc-name-hi hindi">{worker.nameHindi}</div>
          )}
          <div className="wpc-location">
            📍 {worker.village && `${worker.village}, `}{worker.district}
          </div>
        </div>
        <div className="wpc-badges">
          {worker.aadhaarVerified ? (
            <span className="wpc-badge-verified">✓ Aadhaar</span>
          ) : (
            <span className="wpc-badge-pending">⏳ Pending</span>
          )}
          {appStatus && statusConfig[appStatus] && (
            <span className={`wpc-app-status ${statusConfig[appStatus].cls}`}>
              {statusConfig[appStatus].label}
            </span>
          )}
        </div>
      </div>

      {/* Skills row */}
      {!compact && skills.length > 0 && (
        <div className="wpc-skills">
          {skills.map(sid => {
            const s = getSkill(sid);
            return (
              <span key={sid} className="wpc-skill-tag">
                {s.icon} {s.label}
                <span className="hindi wpc-skill-hi">{s.hindi}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Stats row */}
      <div className="wpc-stats">
        <div className="wpc-stat">
          <span className="wpc-stat-val">⭐ {worker.rating?.toFixed(1) ?? '—'}</span>
          <span className="wpc-stat-lbl">Rating<span className="hindi"> रेटिंग</span></span>
        </div>
        <div className="wpc-stat">
          <span className="wpc-stat-val">✅ {worker.totalJobs ?? 0}</span>
          <span className="wpc-stat-lbl">Jobs Done<span className="hindi"> काम</span></span>
        </div>
        <div className="wpc-stat">
          <span className="wpc-stat-val">₹{worker.dailyRate}</span>
          <span className="wpc-stat-lbl">Per Day<span className="hindi"> प्रति दिन</span></span>
        </div>
        <div className="wpc-stat">
          <span className="wpc-stat-val">
            {worker.groupSize === 1 ? '👤 Solo' : `👥 ${worker.groupSize}`}
          </span>
          <span className="wpc-stat-lbl">Group<span className="hindi"> समूह</span></span>
        </div>
      </div>

      {/* Applied date */}
      {appliedAt && (
        <div className="wpc-applied">
          Applied: {new Date(appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </div>
      )}

      {/* Accept / Reject buttons */}
      {(onAccept || onReject) && (
        <div className="wpc-actions">
          {onReject && (
            <button className="btn btn-sm btn-ghost wpc-btn-reject" onClick={onReject}>
              ✕ Reject
            </button>
          )}
          {onAccept && (
            <button className="btn btn-sm btn-primary wpc-btn-accept" onClick={onAccept}>
              ✓ Accept
            </button>
          )}
        </div>
      )}
    </div>
  );
}
