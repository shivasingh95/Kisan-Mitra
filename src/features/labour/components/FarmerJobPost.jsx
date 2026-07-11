// src/components/Labour/FarmerJobPost.jsx — Job posting form for farmer to hire labour
import React, { useState } from 'react';
import './FarmerJobPost.css';
import { useApp } from '@/context/AppContext';
import { postJob } from '@/services/firebase/firestore.service';
import { SKILLS, CROP_TYPES, MP_DISTRICTS } from '@/data/mockWorkers';

const PLATFORM_FEE_PCT = 5;

export default function FarmerJobPost({ onJobPosted }) {
  const { currentUser, showToast } = useApp();

  const [form, setForm] = useState({
    farmerName:      currentUser?.name || 'Demo Farmer',
    cropType:        '',
    jobType:         '',
    workersNeeded:   1,
    startDate:       '',
    endDate:         '',
    dailyRateOffered:500,
    district:        currentUser?.district || '',
    village:         currentUser?.village || '',
    description:     '',
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsPos, setGpsPos] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Live cost calculation ──────────────────────────────────
  const durationDays = (() => {
    if (!form.startDate || !form.endDate) return 0;
    const diff = new Date(form.endDate) - new Date(form.startDate);
    return Math.max(0, Math.ceil(diff / 86400000));
  })();
  const baseCost     = form.workersNeeded * durationDays * form.dailyRateOffered;
  const platformFee  = Math.round(baseCost * PLATFORM_FEE_PCT / 100);
  const totalBudget  = baseCost + platformFee;

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  // ── GPS auto-detect ────────────────────────────────────────
  const detectGPS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported', 'warning');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
        showToast('📍 Location detected!', 'success');
      },
      () => { setGpsLoading(false); showToast('Could not detect location', 'warning'); }
    );
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!form.cropType) newErrors.cropType = 'Select a crop type';
    if (!form.jobType) newErrors.jobType = 'Select a job type';
    if (!form.district) newErrors.district = 'Select a district';
    if (form.workersNeeded < 1) newErrors.workersNeeded = 'Must be at least 1';
    if (form.dailyRateOffered < 100) newErrors.dailyRateOffered = 'Minimum rate is ₹100';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    if (durationDays <= 0) newErrors.endDate = 'End date must be after start date';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors to continue', 'warning');
      return;
    }
    
    setSubmitting(true);
    try {
      const farmerId = currentUser?.id || currentUser?.uid || 'demo_farmer';
      await postJob(farmerId, {
        farmerName:      form.farmerName,
        cropType:        form.cropType,
        jobType:         form.jobType,
        workersNeeded:   Number(form.workersNeeded),
        location: {
          village:  form.village,
          district: form.district,
          lat:      gpsPos?.lat ?? 23.2,
          lng:      gpsPos?.lng ?? 77.08,
        },
        startDate:       new Date(form.startDate).getTime(),
        endDate:         new Date(form.endDate).getTime(),
        durationDays,
        dailyRateOffered: Number(form.dailyRateOffered),
        totalBudget,
        description:     form.description,
      });
      setSuccess(true);
      onJobPosted?.();
      showToast('🎉 Job posted! Workers will be notified.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to post job. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success State ──────────────────────────────────────────
  if (success) {
    return (
      <div className="fjp-success card">
        <div className="fjp-success-icon">🎉</div>
        <h2>Job Posted Successfully!</h2>
        <p className="hindi">काम का विज्ञापन सफलतापूर्वक पोस्ट हो गया।</p>
        <p>Workers in <strong>{form.district}</strong> will be notified about your job.</p>
        <div className="fjp-success-budget">
          <span>Total Budget</span>
          <strong>₹{totalBudget.toLocaleString('en-IN')}</strong>
        </div>
        <button className="btn btn-primary" onClick={() => setSuccess(false)}>
          + Post Another Job
        </button>
      </div>
    );
  }

  return (
    <div className="fjp-wrap">
      <div className="fjp-heading">
        <h2 className="fjp-title">📋 Post a Job</h2>
        <p className="hindi fjp-sub">श्रमिकों को काम पर रखने के लिए विज्ञापन दें</p>
      </div>

      <form className="fjp-form card" onSubmit={handleSubmit}>
        {/* Row 1 — Crop & Job type */}
        <div className="fjp-row-2">
          <div className="form-group">
            <label className="form-label">
              Crop Type <span className="hindi fjp-hi-label">फसल का प्रकार</span>
            </label>
            <select
              className={`form-input form-select ${errors.cropType ? 'input-error' : ''}`}
              value={form.cropType}
              onChange={e => set('cropType', e.target.value)}
            >
              <option value="">Select crop…</option>
              {CROP_TYPES.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label} — {c.hindi}</option>
              ))}
            </select>
            {errors.cropType && <span className="form-error">{errors.cropType}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Job Type <span className="hindi fjp-hi-label">काम का प्रकार</span>
            </label>
            <select
              className={`form-input form-select ${errors.jobType ? 'input-error' : ''}`}
              value={form.jobType}
              onChange={e => set('jobType', e.target.value)}
            >
              <option value="">Select job type…</option>
              {SKILLS.map(s => (
                <option key={s.id} value={s.id}>{s.icon} {s.label} — {s.hindi}</option>
              ))}
            </select>
            {errors.jobType && <span className="form-error">{errors.jobType}</span>}
          </div>
        </div>

        {/* Row 2 — Workers & Rate */}
        <div className="fjp-row-2">
          <div className="form-group">
            <label className="form-label">
              Workers Needed <span className="hindi fjp-hi-label">श्रमिकों की संख्या</span>
            </label>
            <input
              type="number" min="1" max="100"
              className={`form-input ${errors.workersNeeded ? 'input-error' : ''}`}
              value={form.workersNeeded}
              onChange={e => set('workersNeeded', e.target.value)}
            />
            {errors.workersNeeded && <span className="form-error">{errors.workersNeeded}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">
              Daily Rate (₹) <span className="hindi fjp-hi-label">प्रतिदिन दर</span>
            </label>
            <input
              type="number" min="100" step="50"
              className={`form-input ${errors.dailyRateOffered ? 'input-error' : ''}`}
              value={form.dailyRateOffered}
              onChange={e => set('dailyRateOffered', e.target.value)}
            />
            {errors.dailyRateOffered && <span className="form-error">{errors.dailyRateOffered}</span>}
          </div>
        </div>

        {/* Row 3 — Dates */}
        <div className="fjp-row-2">
          <div className="form-group">
            <label className="form-label">
              Start Date <span className="hindi fjp-hi-label">शुरुआत की तारीख</span>
            </label>
            <input
              type="date"
              className={`form-input ${errors.startDate ? 'input-error' : ''}`}
              value={form.startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => set('startDate', e.target.value)}
            />
            {errors.startDate && <span className="form-error">{errors.startDate}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">
              End Date <span className="hindi fjp-hi-label">समाप्ति की तारीख</span>
            </label>
            <input
              type="date"
              className={`form-input ${errors.endDate ? 'input-error' : ''}`}
              value={form.endDate}
              min={form.startDate || new Date().toISOString().split('T')[0]}
              onChange={e => set('endDate', e.target.value)}
            />
            {errors.endDate && <span className="form-error">{errors.endDate}</span>}
          </div>
        </div>

        {/* Row 4 — Location */}
        <div className="fjp-row-2">
          <div className="form-group">
            <label className="form-label">
              District <span className="hindi fjp-hi-label">जिला</span>
            </label>
            <select
              className={`form-input form-select ${errors.district ? 'input-error' : ''}`}
              value={form.district}
              onChange={e => set('district', e.target.value)}
            >
              <option value="">Select district…</option>
              {MP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.district && <span className="form-error">{errors.district}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">
              Village <span className="hindi fjp-hi-label">गाँव</span>
            </label>
            <div className="fjp-gps-row">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Barwaha"
                value={form.village}
                onChange={e => set('village', e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm fjp-gps-btn"
                onClick={detectGPS}
                disabled={gpsLoading}
              >
                {gpsLoading ? '⏳' : '📍'}
              </button>
            </div>
            {gpsPos && (
              <span className="form-hint">
                ✓ GPS: {gpsPos.lat.toFixed(4)}, {gpsPos.lng.toFixed(4)}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">
            Additional Notes <span className="hindi fjp-hi-label">अतिरिक्त जानकारी</span>
          </label>
          <textarea
            className="form-input fjp-textarea"
            placeholder="Describe the work, tools provided, accommodation, etc."
            rows={3}
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </div>

        {/* Live Cost Calculator */}
        {durationDays > 0 && (
          <div className="fjp-cost-calc">
            <div className="fjp-cost-title">💰 Cost Calculator <span className="hindi">लागत गणना</span></div>
            <div className="fjp-cost-rows">
              <div className="fjp-cost-row">
                <span>{form.workersNeeded} workers × {durationDays} days × ₹{form.dailyRateOffered}</span>
                <strong>₹{baseCost.toLocaleString('en-IN')}</strong>
              </div>
              <div className="fjp-cost-row fjp-cost-fee">
                <span>Platform Fee ({PLATFORM_FEE_PCT}%)</span>
                <strong>+ ₹{platformFee.toLocaleString('en-IN')}</strong>
              </div>
              <div className="fjp-cost-divider" />
              <div className="fjp-cost-row fjp-cost-total">
                <span>Total Budget</span>
                <strong>₹{totalBudget.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={submitting}
          style={{ marginTop: 8 }}
        >
          {submitting ? '⏳ Posting…' : '🚀 Post Job — काम पोस्ट करें'}
        </button>
      </form>
    </div>
  );
}


