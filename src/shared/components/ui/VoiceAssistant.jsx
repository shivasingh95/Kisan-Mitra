// src/shared/components/ui/VoiceAssistant.jsx
// Floating voice assistant utilizing Web Speech Recognition & Speech Synthesis for rural farmers
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { useWeather } from '@/shared/hooks/useWeather';
import { trackFeatureClick } from '@/shared/utils/analytics';
import './VoiceAssistant.css';

export default function VoiceAssistant() {
  const routerNavigate = useNavigate();
  const { isHindi } = useTranslation();
  const { weather } = useWeather();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showModal, setShowModal] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = isHindi ? 'hi-IN' : 'en-IN';

    recog.onresult = (e) => {
      const current = e.results[0][0].transcript;
      setTranscript(current);
    };

    recog.onend = () => {
      setListening(false);
    };

    recog.onerror = (e) => {
      console.warn('[VoiceAssistant] Recognition error:', e.error);
      setListening(false);
    };

    recognitionRef.current = recog;
  }, [isHindi]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = isHindi ? 'hi-IN' : 'en-IN';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  const handleCommand = (rawText) => {
    const text = rawText.toLowerCase();
    trackFeatureClick('voice_command');

    if (text.includes('fasal') || text.includes('doctor') || text.includes('bimari') || text.includes('रोग') || text.includes('crop') || text.includes('डॉक्टर') || text.includes('फ़सल')) {
      speak(isHindi ? 'फ़सल डॉक्टर खोला जा रहा है' : 'Opening Crop Doctor AI');
      routerNavigate('/crop-doctor');
    } else if (text.includes('mandi') || text.includes('bhav') || text.includes('becho') || text.includes('मंडी') || text.includes('भाव') || text.includes('बेच') || text.includes('market') || text.includes('price')) {
      speak(isHindi ? 'मंडी भाव और बिक्री पृष्ठ खोला जा रहा है' : 'Opening Marketplace and Mandi prices');
      routerNavigate('/marketplace-sell');
    } else if (text.includes('mazdoor') || text.includes('shramik') || text.includes('labour') || text.includes('मजदूर') || text.includes('मज़दूर') || text.includes('श्रमिक')) {
      speak(isHindi ? 'मज़दूर सेवा खोली जा रही है' : 'Opening Labour Hire');
      routerNavigate('/labour-hire');
    } else if (text.includes('tractor') || text.includes('machine') || text.includes('upkaran') || text.includes('उपकरण') || text.includes('ट्रैक्टर') || text.includes('rent') || text.includes('equipment')) {
      speak(isHindi ? 'उपकरण किराया पृष्ठ खोला जा रहा है' : 'Opening Equipment Rental');
      routerNavigate('/equipment-rent');
    } else if (text.includes('expert') || text.includes('salah') || text.includes('visheshagya') || text.includes('विशेषज्ञ') || text.includes('सलाह') || text.includes('consult')) {
      speak(isHindi ? 'कृषि विशेषज्ञ परामर्श खोला जा रहा है' : 'Opening Expert Consultation');
      routerNavigate('/expert-connect');
    } else if (text.includes('rin') || text.includes('loan') || text.includes('yojana') || text.includes('ऋण') || text.includes('योजना') || text.includes('kcc') || text.includes('subsidy')) {
      speak(isHindi ? 'ऋण व सरकारी योजनाएं खोली जा रही हैं' : 'Opening Loans and Schemes');
      routerNavigate('/fintech');
    } else if (text.includes('mausam') || text.includes('barish') || text.includes('मौसम') || text.includes('बारिश') || text.includes('weather') || text.includes('rain')) {
      const reply = isHindi
        ? `आज ${weather?.city || 'आपके क्षेत्र'} में तापमान ${weather?.temp || 30} डिग्री है और ${weather?.condition || 'मौसम सामान्य है'}`
        : `Currently in ${weather?.city || 'your area'}, temperature is ${weather?.temp || 30}°C with ${weather?.condition || 'normal conditions'}`;
      speak(reply);
      routerNavigate('/dashboard');
    } else if (text.includes('home') || text.includes('dashboard') || text.includes('होम')) {
      speak(isHindi ? 'होम डैशबोर्ड' : 'Going to Home Dashboard');
      routerNavigate('/dashboard');
    } else {
      speak(isHindi ? 'माफ़ करें, समझ नहीं आया। "फ़सल डॉक्टर", "मंडी भाव", या "मौसम" बोलें।' : 'Sorry, command not recognized. Try saying Crop Doctor or Mandi prices.');
    }

    setTimeout(() => {
      setShowModal(false);
    }, 2000);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(isHindi ? 'आपके ब्राउज़र में वॉइस सपोर्ट उपलब्ध नहीं है।' : 'Voice recognition not supported in this browser.');
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setTranscript('');
      setShowModal(true);
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (err) {
        console.warn('Voice recognition start error:', err);
      }
    }
  };

  // Watch for transcript settlement
  useEffect(() => {
    if (!listening && transcript) {
      handleCommand(transcript);
    }
  }, [listening, transcript]);

  return (
    <>
      <button 
        className={`voice-assistant-fab ${listening ? 'listening' : ''}`}
        onClick={toggleListening}
        aria-label={isHindi ? 'वॉइस असिस्टेंट (बोलकर चलाएं)' : 'Voice Assistant'}
        title={isHindi ? 'बोलकर चलाएं (Voice Assistant)' : 'Voice Assistant'}
      >
        <span aria-hidden="true">{listening ? '🛑' : '🎙️'}</span>
      </button>

      {showModal && (
        <div className="voice-assistant-modal" role="dialog" aria-modal="true">
          <div className="voice-modal-header">
            <div className="voice-modal-title">
              <span>🎙️</span>
              <span>{listening ? (isHindi ? 'सुन रहा हूँ…' : 'Listening…') : (isHindi ? 'आदेश प्रोसेस हो रहा है' : 'Processing…')}</span>
            </div>
            {listening && (
              <div className="voice-wave-anim" aria-hidden="true">
                <div className="voice-wave-bar" />
                <div className="voice-wave-bar" />
                <div className="voice-wave-bar" />
                <div className="voice-wave-bar" />
              </div>
            )}
            <button 
              className="pwa-install-close" 
              onClick={() => { setListening(false); setShowModal(false); }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="voice-transcript-box">
            {transcript || (isHindi ? 'बोलिए: "मंडी भाव", "फ़सल डॉक्टर", "मौसम"…' : 'Speak: "Crop Doctor", "Mandi prices", "Weather"…')}
          </div>

          <div className="voice-hints">
            <span>{isHindi ? 'उदाहरण आदेश:' : 'Example commands:'}</span><br />
            <span className="voice-hint-pill">🌾 {isHindi ? 'मंडी भाव' : 'Mandi'}</span>
            <span className="voice-hint-pill">🔬 {isHindi ? 'फ़सल डॉक्टर' : 'Crop Doctor'}</span>
            <span className="voice-hint-pill">⛅ {isHindi ? 'मौसम' : 'Weather'}</span>
            <span className="voice-hint-pill">🚜 {isHindi ? 'ट्रैक्टर' : 'Equipment'}</span>
          </div>
        </div>
      )}
    </>
  );
}
