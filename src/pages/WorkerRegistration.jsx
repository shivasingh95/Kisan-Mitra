// src/pages/WorkerRegistration.jsx — Worker onboarding & registration
import React, { useState } from 'react';
import './WorkerRegistration.css';
import { useApp } from '@/context/AppContext';
import { registerWorker } from '@/services/firebase/firestore.service';
import { SKILLS, MP_DISTRICTS } from '../data/mockWorkers';

export default function WorkerRegistration() {
  const { currentUser, firebaseUser, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || '', phone: currentUser?.phone || '',
    village: currentUser?.village || '', district: currentUser?.district || '',
    state: 'Madhya Pradesh', aadhaar: '', upiId: '',
    skills: [], dailyRate: 500, groupSize: 1,
    availableFrom: '', availableTo: '', lat: null, lng: null,
  });
  const [errors, setErrors] = useState({});
  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };
  const toggleSkill = id => set('skills', form.skills.includes(id) ? form.skills.filter(s => s !== id) : [...form.skills, id]);

  const detectGPS = () => {
    if (!navigator.geolocation) { showToast('Geolocation not supported', 'warning'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { set('lat', pos.coords.latitude); set('lng', pos.coords.longitude); setGpsLoading(false); showToast('📍 Location detected!', 'success'); },
      () => { setGpsLoading(false); showToast('Could not detect location', 'warning'); }
    );
  };

  const handleSubmit = async () => {
    if (!form.name || !form.district || form.skills.length === 0) { showToast('Fill all required fields', 'warning'); return; }
    setSubmitting(true);
    try {
      const uid = firebaseUser?.uid || currentUser?.id || 'demo_worker';
      await registerWorker(uid, {
        name: form.name, phone: form.phone, village: form.village,
        district: form.district, state: form.state,
        skills: form.skills, dailyRate: Number(form.dailyRate),
        groupSize: Number(form.groupSize),
        availableFrom: form.availableFrom ? new Date(form.availableFrom).getTime() : null,
        availableTo:   form.availableTo   ? new Date(form.availableTo).getTime()   : null,
        upiId: form.upiId, lat: form.lat ?? 23.2, lng: form.lng ?? 77.08,
      });
      setDone(true);
    } catch (err) { console.error(err); showToast('Registration failed. Try again.', 'error'); }
    finally { setSubmitting(false); }
  };

  if (done) {
    return (
      <div className="wreg-done anim-page">
        <div className="wreg-done-card card">
          <div className="wreg-done-icon">🟡</div>
          <h2>Verification Pending</h2>
          <p className="hindi">आपका पंजीकरण प्राप्त हो गया है।</p>
          <p>Your worker profile has been submitted. Aadhaar verification within <strong>24 hours</strong>.</p>
          <div className="wreg-done-steps">
            <div className="wreg-done-step done">✅ Profile Submitted</div>
            <div className="wreg-done-step pending">🟡 Aadhaar Verification (pending)</div>
            <div className="wreg-done-step inactive">⬜ Profile Live — Receive job offers</div>
          </div>
        </div>
      </div>
    );
  }

  const stepLabels = ['', 'Personal Info', 'Skills & Rate', 'Availability'];

  return (
    <div className="wreg-wrap anim-page">
      <div className="wreg-header">
        <h1 className="page-title">👷 Register as Worker</h1>
        <p className="page-sub hindi">श्रमिक के रूप में पंजीकरण करें और काम पाएं</p>
      </div>

      <div className="wreg-steps step-bar">
        {[1,2,3].map(s => (
          <React.Fragment key={s}>
            <div className={`step-node ${s < step ? 'done' : s === step ? 'active' : 'inactive'}`}>{s < step ? '✓' : s}</div>
            {s < 3 && <div className={`step-connector ${s < step ? 'done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>
      <div className="wreg-step-label">{stepLabels[step]}</div>

      <div className="card wreg-form">
        {step === 1 && (
          <div className="wreg-step-content">
            <div className="form-group">
              <label className="form-label">Full Name <span className="hindi wreg-hi">पूरा नाम</span></label>
              <input className="form-input" placeholder="e.g. Rakesh Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone <span className="hindi wreg-hi">मोबाइल</span></label>
              <input className={`form-input ${errors.phone ? 'input-error' : ''}`} placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>
            <div className="wreg-row-2">
              <div className="form-group">
                <label className="form-label">Village <span className="hindi wreg-hi">गाँव</span></label>
                <input className="form-input" placeholder="e.g. Barwaha" value={form.village} onChange={e => set('village', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">District <span className="hindi wreg-hi">जिला</span></label>
                <select className="form-input form-select" value={form.district} onChange={e => set('district', e.target.value)}>
                  <option value="">Select district…</option>
                  {MP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <button type="button" className="btn btn-secondary wreg-gps-btn" onClick={detectGPS} disabled={gpsLoading}>
                {gpsLoading ? '⏳ Detecting…' : '📍 Auto-detect location'}
              </button>
              {form.lat && <span className="form-hint">✓ GPS: {form.lat.toFixed(4)}, {form.lng.toFixed(4)}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Aadhaar Number <span className="hindi wreg-hi">आधार नंबर</span></label>
              <input className={`form-input ${errors.aadhaar ? 'input-error' : ''}`} placeholder="XXXX XXXX XXXX" maxLength={14} value={form.aadhaar} onChange={e => {
                const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                set('aadhaar', val);
              }} />
              {errors.aadhaar ? <span className="form-error">{errors.aadhaar}</span> : <span className="form-hint">🔒 Stored encrypted. Verification within 24h.</span>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wreg-step-content">
            <div className="form-group">
              <label className="form-label">Skills <span className="hindi wreg-hi">कौशल चुनें</span></label>
              <div className="wreg-skills-grid">
                {SKILLS.map(s => (
                  <button key={s.id} type="button" className={`wreg-skill-btn ${form.skills.includes(s.id) ? 'selected' : ''}`} onClick={() => toggleSkill(s.id)}>
                    <span className="wreg-skill-icon">{s.icon}</span>
                    <span className="wreg-skill-label">{s.label}</span>
                    <span className="hindi wreg-skill-hi">{s.hindi}</span>
                    {form.skills.includes(s.id) && <span className="wreg-skill-check">✓</span>}
                  </button>
                ))}
              </div>
              {form.skills.length === 0 && <span className="form-error">Select at least one skill</span>}
            </div>
            <div className="wreg-row-2">
              <div className="form-group">
                <label className="form-label">Daily Rate (₹) <span className="hindi wreg-hi">दैनिक दर</span></label>
                <input type="number" min="100" step="50" className="form-input" value={form.dailyRate} onChange={e => set('dailyRate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Group Size <span className="hindi wreg-hi">समूह</span></label>
                <select className="form-input form-select" value={form.groupSize} onChange={e => set('groupSize', e.target.value)}>
                  <option value={1}>👤 Individual</option>
                  {[2,3,4,5,6,8,10,15,20].map(n => <option key={n} value={n}>👥 Group of {n}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">UPI ID <span className="hindi wreg-hi">UPI आईडी</span></label>
              <input className="form-input" placeholder="yourname@upi" value={form.upiId} onChange={e => set('upiId', e.target.value)} />
              <span className="form-hint">Payments will be sent to this UPI ID</span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wreg-step-content">
            <div className="wreg-avail-hero">
              <span style={{ fontSize: '3rem' }}>📅</span>
              <h3>Set Your Availability</h3>
              <p className="hindi">अपनी उपलब्धता निर्धारित करें</p>
            </div>
            <div className="wreg-row-2">
              <div className="form-group">
                <label className="form-label">Available From <span className="hindi wreg-hi">से उपलब्ध</span></label>
                <input type="date" className="form-input" value={form.availableFrom} onChange={e => set('availableFrom', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Available Until <span className="hindi wreg-hi">तक उपलब्ध</span></label>
                <input type="date" className="form-input" value={form.availableTo} min={form.availableFrom} onChange={e => set('availableTo', e.target.value)} />
              </div>
            </div>
            <div className="wreg-summary">
              <div className="wreg-summary-title">📋 Profile Preview <span className="hindi" style={{ fontSize: 12, fontWeight: 400 }}>पूर्वावलोकन</span></div>
              <div className="wreg-summary-rows">
                {[['Name', form.name || '—'], ['Location', [form.village, form.district].filter(Boolean).join(', ') || '—'], ['Skills', form.skills.length > 0 ? form.skills.map(id => SKILLS.find(s => s.id === id)?.icon + ' ' + SKILLS.find(s => s.id === id)?.label).join(', ') : '—'], ['Daily Rate', `₹${form.dailyRate}`], ['Group', form.groupSize == 1 ? 'Individual' : `Group of ${form.groupSize}`]].map(([lbl, val]) => (
                  <div key={lbl} className="wreg-summary-row">
                    <span>{lbl}</span><strong>{val}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="wreg-nav">
          {step > 1 && <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>}
          {step < 3 ? (
            <button className="btn btn-primary" onClick={() => {
              if (step === 1) {
                const newErrors = {};
                if (!form.name) newErrors.name = 'Name is required';
                if (!form.district) newErrors.district = 'District is required';
                
                const phoneDigits = form.phone.replace(/\D/g, '');
                if (phoneDigits.length < 10) newErrors.phone = 'Enter a valid 10-digit phone number';
                
                const aadhaarDigits = form.aadhaar.replace(/\D/g, '');
                if (aadhaarDigits.length !== 12) newErrors.aadhaar = 'Aadhaar must be exactly 12 digits';

                if (Object.keys(newErrors).length > 0) {
                  setErrors(newErrors);
                  showToast('Please fix the errors to continue', 'warning');
                  return;
                }
              }
              if (step === 2 && form.skills.length === 0) { showToast('Select at least one skill', 'warning'); return; }
              setStep(s => s + 1);
            }}>Next →</button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '⏳ Registering…' : '✅ Register as Worker'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

