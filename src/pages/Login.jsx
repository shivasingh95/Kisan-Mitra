import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/i18n/useTranslation';
import { setupRecaptcha, sendPhoneOTP, verifyPhoneOTP } from '@/services/firebase/auth.service';
import { trackLogin } from '@/shared/utils/analytics';
import '../styles/login.css';

const FEATURES = [
  { icon: '🔬', title: 'AI Crop Doctor',      titleHi: 'फ़सल डॉक्टर AI',   desc: 'Photo lo, bimari pakdo — instantly', descHi: 'तस्वीर लें, बीमारी तुरंत पहचानें' },
  { icon: '📈', title: 'Live Mandi Prices',   titleHi: 'लाइव मंडी भाव',    desc: 'Real-time bhav — seedha mandi se', descHi: 'सीधा मंडी से ताज़ा भाव' },
  { icon: '👨‍💼', title: 'Expert Connect',      titleHi: 'विशेषज्ञ से जुड़ें', desc: 'Specialist se seedha baat karo', descHi: 'कृषि वैज्ञानिकों से सीधी सलाह' },
  { icon: '💳', title: 'Loans & Schemes',     titleHi: 'ऋण व योजनाएं',     desc: 'PM Kisan, KCC sab ek jagah', descHi: 'पीएम किसान, केसीसी सब एक जगह' },
];

export default function Login() {
  const { loginWithOTP, handleAuthSuccess } = useApp();
  const { t, isHindi, toggleLang } = useTranslation();
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
      setError(t('auth.invalidPhone'));
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
        setError(t('auth.invalidPhone'));
      } else if (err.code === 'auth/too-many-requests') {
        setError(isHindi ? 'बहुत सारे प्रयास। कृपया कुछ मिनट प्रतीक्षा करें।' : 'Too many attempts. Please wait a few minutes.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError(isHindi ? 'SMS कोटा समाप्त। कृपया डेमो मोड का उपयोग करें।' : 'SMS quota exceeded for today. Use Demo mode instead.');
      } else {
        setError(t('auth.otpError'));
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
    if (code.length < 6) { setError(t('auth.invalidOTP')); return; }
    setError('');
    setStep('loading');
    try {
      const fbUser = await verifyPhoneOTP(code);
      trackLogin('phone_otp');
      await handleAuthSuccess(fbUser);
    } catch (err) {
      console.error('OTP verify error:', err);
      setStep('otp');
      if (err.code === 'auth/invalid-verification-code') {
        setError(t('auth.verifyError'));
      } else if (err.code === 'auth/code-expired') {
        setError(isHindi ? 'OTP समाप्त हो गया। दोबारा भेजें।' : 'OTP expired. Please resend.');
        setStep('phone');
      } else {
        setError(t('auth.verifyError'));
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
      setError(t('auth.otpError'));
    }
  };

  // ── Demo login (skip Firebase for presentations) ─────────
  const goDemo = () => {
    trackLogin('demo');
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
          <h1 className="login-brand-title hindi">{t('app.name')}</h1>
          <p className="login-brand-tagline">{t('app.tagline')}</p>
        </div>

        {/* Feature cards */}
        <div className="login-features">
          {FEATURES.map((f, i) => (
            <div key={i} className={`login-feat-card anim-fadeup delay-${i + 2}`}>
              <div className="login-feat-icon-wrap">
                <span className="login-feat-icon">{f.icon}</span>
              </div>
              <div>
                <div className="login-feat-title">{isHindi ? f.titleHi : f.title}</div>
                <div className="login-feat-desc hindi">{isHindi ? f.descHi : f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="login-stats">
          <div className="login-stat">
            <span className="login-stat-num">2.4L+</span>
            <span>{isHindi ? 'किसान' : 'Farmers'}</span>
          </div>
          <div className="login-stat">
            <span className="login-stat-num">18K+</span>
            <span>{isHindi ? 'विशेषज्ञ' : 'Experts'}</span>
          </div>
          <div className="login-stat">
            <span className="login-stat-num">₹340Cr</span>
            <span>{isHindi ? 'लेन-देन' : 'Transactions'}</span>
          </div>
        </div>
      </div>

      {/* ════════════ RIGHT — Auth card ════════════ */}
      <div className="login-right">
        {/* Top right language switch */}
        <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 10 }}>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={toggleLang}
            style={{ 
              background: 'rgba(255,255,255,0.7)', 
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            🌐 {isHindi ? 'English' : 'हिंदी'}
          </button>
        </div>

        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container" />
        <div className="login-card">

          {/* App icon */}
          <div className="login-card-icon">🌿</div>

          {/* ── STEP: Phone number entry ─────────────────── */}
          {step === 'phone' && (
            <>
              <div className="login-card-header">
                <h2 className="hindi">{t('auth.loginTitle')}</h2>
                <p>{t('auth.loginSubtitle')}</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone-input">{t('auth.mobileNumber')}</label>
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
                {t('auth.sendOTP')}
              </button>

              <div className="divider-text">{t('auth.or')}</div>

              <button id="demo-btn" className="btn btn-secondary btn-full" onClick={goDemo}>
                {t('auth.demoMode')}
              </button>

              <p className="login-legal hindi">
                {t('auth.legalText')}
              </p>
            </>
          )}

          {/* ── STEP: OTP verification ───────────────────── */}
          {step === 'otp' && (
            <>
              <button className="login-back-btn" onClick={() => setStep('phone')}>
                ← {isHindi ? 'वापस जाएं' : 'Go back'}
              </button>
              <div className="login-card-header">
                <h2 className="hindi">{t('auth.verifyOTP')}</h2>
                <p>+91 {phone} — {t('auth.enterOTP')}</p>
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
                {t('auth.verifyOTP')}
              </button>

              <div className="otp-resend-area">
                {timer > 0
                  ? <span className="otp-timer">⏱ {isHindi ? `दोबारा भेजें ${timer}s में` : `Resend in ${timer}s`}</span>
                  : <button className="btn btn-ghost btn-sm" onClick={resendOTP}>↺ {isHindi ? 'दोबारा OTP भेजें' : 'Resend OTP'}</button>
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
              <h3 className="hindi">{isHindi ? 'प्रमाणीकरण हो रहा है…' : 'Verifying…'}</h3>
              <p>{isHindi ? 'एक सेकंड — आपका खाता तैयार हो रहा है' : 'One second — setting up your account'}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
