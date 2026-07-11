import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { setupRecaptcha, sendPhoneOTP, verifyPhoneOTP } from '@/services/firebase/auth.service';
import '../styles/login.css';

const FEATURES = [
  { icon: '🔬', title: 'AI Crop Doctor',      desc: 'Photo lo, bimari pakdo — instantly' },
  { icon: '📈', title: 'Live Mandi Prices',   desc: 'Real-time bhav — seedha mandi se' },
  { icon: '👨‍💼', title: 'Expert Connect',      desc: 'Specialist se seedha baat karo' },
  { icon: '💳', title: 'Loans & Schemes',     desc: 'PM Kisan, KCC sab ek jagah' },
];

export default function Login() {
  const { loginWithOTP, handleAuthSuccess, showToast } = useApp();
  const [step, setStep] = useState('phone'); // phone | otp | loading
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const otpRefs = useRef([]);

  // Countdown timer for "Resend OTP"
  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(t => t - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  // ── Phone input handler ──────────────────────────────────
  const handlePhone = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(v);
    setError('');
  };

  // ── Send OTP via Firebase ────────────────────────────────
  const sendOTP = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit number');
      return;
    }
    setError('');
    setStep('loading');
    try {
      setupRecaptcha();
      await sendPhoneOTP(phone);
      setStep('otp');
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      console.error('OTP send error:', err.code, err.message);
      setStep('phone');
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Please check and retry.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Phone login not enabled. Enable it in Firebase Console → Authentication → Sign-in method → Phone.');
      } else if (err.code === 'auth/captcha-check-failed' || err.code === 'auth/argument-error') {
        if (window.recaptchaVerifier) { window.recaptchaVerifier.clear(); window.recaptchaVerifier = null; }
        setError('reCAPTCHA failed. Please click "OTP bhejo" once more.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded for today. Use Demo mode instead.');
      } else if (err.code === 'auth/app-not-authorized') {
        setError('App not authorized. Check Firebase project settings.');
      } else {
        setError(`Error: ${err.code || err.message || 'Unknown. Check browser console.'}`);
      }
    }
  };

  // ── OTP digit input ──────────────────────────────────────
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  // ── Handle OTP paste (e.g. from SMS autofill) ────────────
  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Verify OTP via Firebase ──────────────────────────────
  const verifyOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits'); return; }
    setError('');
    setStep('loading');
    try {
      const fbUser = await verifyPhoneOTP(code);
      await handleAuthSuccess(fbUser);
    } catch (err) {
      console.error('OTP verify error:', err);
      setStep('otp');
      if (err.code === 'auth/invalid-verification-code') {
        setError('Galat OTP. Phir se check karo.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expire ho gaya. Dobara bhejiye.');
        setStep('phone');
      } else {
        setError('Verification failed. Please retry.');
      }
    }
  };

  // ── Resend OTP ───────────────────────────────────────────
  const resendOTP = async () => {
    setStep('loading');
    try {
      setupRecaptcha();
      await sendPhoneOTP(phone);
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      setStep('otp');
      setError('');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setStep('otp');
      setError('Dobara OTP bhejne mein dikkat. Please wait.');
    }
  };

  // ── Demo login (skip Firebase for presentations) ─────────
  const goDemo = () => {
    loginWithOTP('9999999999', { name: 'Ramesh Kumar', role: 'farmer', village: 'Sehore, MP' });
  };

  return (
    <div className="login-page">
      {/* ════════════ LEFT — Branding ════════════ */}
      <div className="login-left">
        {/* Decorative circles */}
        <div className="deco-circle-1" />
        <div className="deco-circle-2" />
        <div className="deco-circle-3" />

        {/* Brand */}
        <div className="login-brand anim-fadein">
          <div className="login-brand-badge">India's #1 Kisan Platform</div>
          <span className="login-brand-logo">🌿</span>
          <h1 className="login-brand-title hindi">कृषि Mitra</h1>
          <p className="login-brand-tagline">India's smartest kisan platform</p>
        </div>

        {/* Feature cards */}
        <div className="login-features">
          {FEATURES.map((f, i) => (
            <div key={i} className={`login-feat-card anim-fadeup delay-${i + 2}`}>
              <div className="login-feat-icon-wrap">
                <span className="login-feat-icon">{f.icon}</span>
              </div>
              <div>
                <div className="login-feat-title">{f.title}</div>
                <div className="login-feat-desc hindi">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="login-stats">
          <div className="login-stat">
            <span className="login-stat-num">2.4L+</span>
            <span>Farmers</span>
          </div>
          <div className="login-stat">
            <span className="login-stat-num">18K+</span>
            <span>Experts</span>
          </div>
          <div className="login-stat">
            <span className="login-stat-num">₹340Cr</span>
            <span>Transactions</span>
          </div>
        </div>
      </div>

      {/* ════════════ RIGHT — Auth card ════════════ */}
      <div className="login-right">
        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container" />
        <div className="login-card">

          {/* App icon */}
          <div className="login-card-icon">🌿</div>

          {/* ── STEP: Phone number entry ─────────────────── */}
          {step === 'phone' && (
            <>
              <div className="login-card-header">
                <h2 className="hindi">Login करें</h2>
                <p>Apna mobile number daliye — OTP aayega</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone-input">Mobile Number</label>
                <div className="phone-input-wrap">
                  <span className="phone-prefix" aria-hidden="true">🇮🇳 +91</span>
                  <input
                    id="phone-input"
                    type="tel"
                    inputMode="numeric"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={handlePhone}
                    onKeyDown={e => e.key === 'Enter' && sendOTP()}
                    autoFocus
                    aria-describedby={error ? 'phone-error' : undefined}
                    aria-invalid={!!error}
                  />
                </div>
                {error && <span className="form-error" id="phone-error" role="alert" aria-live="polite">{error}</span>}
              </div>

              <button id="send-otp-btn" className="btn btn-primary btn-full btn-lg" onClick={sendOTP}>
                OTP bhejo 📲
              </button>

              <div className="divider-text">ya</div>

              <button id="demo-btn" className="btn btn-secondary btn-full" onClick={goDemo}>
                🚀 Demo mein try karo — bina login ke
              </button>

              <p className="login-legal hindi">
                Login karke aap hamare Terms of Service aur Privacy Policy se agree karte hain.
                Aapka data surakshit hai. 🔒
              </p>
            </>
          )}

          {/* ── STEP: OTP verification ───────────────────── */}
          {step === 'otp' && (
            <>
              <button className="login-back-btn" onClick={() => setStep('phone')}>
                ← Wapas jaao
              </button>
              <div className="login-card-header">
                <h2 className="hindi">OTP Verify करें</h2>
                <p>+91 {phone} pe 6-digit OTP bheja gaya hai</p>
              </div>

              <div className="otp-row" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-input-${i}`}
                    ref={el => otpRefs.current[i] = el}
                    className={`otp-input ${d ? 'filled' : ''}`}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && (
                <p className="form-error" id="otp-error" role="alert" aria-live="polite" style={{ marginBottom: 16 }}>{error}</p>
              )}

              <button id="verify-otp-btn" className="btn btn-primary btn-full btn-lg" onClick={verifyOTP}
                style={{ marginBottom: 8 }}>
                Verify karo ✓
              </button>

              <div className="otp-resend-area">
                {timer > 0
                  ? <span className="otp-timer">⏱ Dobara bhejo {timer}s mein</span>
                  : <button className="btn btn-ghost btn-sm" onClick={resendOTP}>↺ Dobara OTP bhejo</button>
                }
              </div>
            </>
          )}

          {/* ── STEP: Loading / verifying ──────────────────── */}
          {step === 'loading' && (
            <div className="login-loading">
              <div className="login-spinner-wrap">
                <div className="login-spinner" />
                <div className="login-spinner-inner" />
              </div>
              <span className="login-loading-icon">🌱</span>
              <h3 className="hindi">Verify ho raha hai…</h3>
              <p>Ek second — aapka account ready ho raha hai</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

