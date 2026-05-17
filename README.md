# 🌿 Krishi Mitra — India's Smartest Kisan Platform

> **Kisan ka saathi** — AI-powered agricultural companion for 140M+ Indian farmers

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite)
![CSS](https://img.shields.io/badge/CSS-Vanilla-1572B6?style=flat&logo=css3)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# http://localhost:5173
```

Click **"Demo mein try karo"** on the login screen to skip OTP and explore the full platform instantly.

---

## 📱 Platform Overview

Krishi Mitra serves **3 user types** on a single platform:

| Role | Who | Key Features |
|------|-----|--------------|
| 👨‍🌾 **Farmer** | Primary user — gaon ka kisan | AI Crop Doctor, Mandi Prices, Expert Connect, Loan Apply |
| 👨‍🏫 **Expert** | Knowledge seller — agriculture specialist | Session management, earnings tracker, farmer Q&A |
| 🏪 **Buyer** | Restaurant chains, exporters, agri companies | Browse listings, bulk order, delivery tracking |
| ⚙️ **Admin** | Platform team (internal only) | User stats, expert verification, revenue analytics |

---

## 📂 Project Structure

```
src/
├── styles/
│   ├── variables.css      ← Design tokens (colors, shadows, spacing)
│   ├── animations.css     ← All keyframes + 3D animation utilities
│   └── components.css     ← Shared UI: buttons, cards, badges, forms
├── context/
│   └── AppContext.jsx     ← Global state: auth, role, navigation, toast
├── components/
│   └── Layout/
│       ├── Sidebar.jsx    ← Role-based navigation sidebar
│       ├── Sidebar.css
│       ├── Navbar.jsx     ← Top bar: title, weather, alerts, profile
│       └── Navbar.css
└── pages/
    ├── Login.jsx           ← Phone OTP login (Hindi UI)
    ├── farmer/
    │   ├── HomeDashboard.jsx    ← Weather + alerts + quick actions
    │   ├── CropDoctor.jsx       ← AI disease detection + Hindi voice
    │   ├── MarketplaceSell.jsx  ← Mandi prices + sell listings
    │   ├── LabourHire.jsx       ← Labour + equipment rental (tabbed)
    │   ├── ExpertConnect.jsx    ← Expert cards + free demo booking
    │   ├── FinTech.jsx          ← Schemes + KCC loan + income chart
    │   └── FarmProfile.jsx      ← Unified profile + activity history
    ├── expert/
    │   └── ExpertDashboard.jsx  ← Sessions + questions + earnings
    ├── buyer/
    │   └── MarketplaceBrowse.jsx ← Browse + filter + order tracking
    └── admin/
        └── AdminDashboard.jsx   ← Users + verifications + revenue
```

---

## 🎨 Design System

### Color Palette

| Token | Value | Use |
|-------|-------|-----|
| `--primary` | `#2D6A4F` | Main brand color, buttons, active states |
| `--primary-light` | `#52B788` | Highlights, badges, icons |
| `--primary-pale` | `#D8F3DC` | Card backgrounds, hover fills |
| `--bg-app` | `#F4FCF5` | Page background |
| `--bg-card` | `#FFFFFF` | Card surfaces |
| `--text-900` | `#1B4332` | Primary text |
| `--text-muted` | `#4A7C59` | Secondary text |

### Typography
- **UI Text**: Inter (400, 500, 600, 700, 800, 900)
- **Hindi Text**: Noto Sans Devanagari — use `class="hindi"` on any element

### 3D Card Animations
```css
/* Apply to any card for 3D mouse-tilt effect */
class="card card-3d"

/* Float animation */
class="anim-float"

/* Staggered page entries */
class="anim-fadeup delay-1"  /* through delay-8 */
```

### Button Variants
```jsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-ghost">Ghost</button>
<button className="btn btn-danger">Danger</button>
<button className="btn btn-primary btn-sm">Small</button>
<button className="btn btn-primary btn-lg">Large</button>
<button className="btn btn-primary btn-full">Full Width</button>
```

---

## 🔑 Key Features

### 1. 🔬 AI Crop Doctor
- Photo upload with drag-and-drop
- Real-time scan animation (scan line, corner markers)
- Disease detection with confidence score
- Treatment plan (step-by-step)
- **Hindi voice output** using Web Speech API (`SpeechSynthesisUtterance`, `lang: 'hi-IN'`)
- Scan history tracking

**AI Integration Point** (`src/pages/farmer/CropDoctor.jsx`):
```js
// Replace mock timer with actual Claude API call:
const response = await fetch('/api/diagnose', {
  method: 'POST',
  body: formData, // image file
});
const result = await response.json();
setResult(result);
```

### 2. 📈 Live Mandi Prices
- Real-time price table with SVG sparklines
- MSP comparison indicators
- Trend badges (up/down) with color coding
- One-click "Sell" from price row
- Add listing modal with form validation

**AGMARKNET Integration Point** (`src/pages/farmer/MarketplaceSell.jsx`):
```js
// Replace MANDI_PRICES with real API call:
const prices = await fetch('https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=YOUR_KEY');
```

### 3. 👨‍💼 Expert Connect
- Filter by specialization
- Expert profile cards with ratings
- Free demo slot picker
- Booking confirmation flow
- **Always-free demo** policy

### 4. 💳 Loans & Schemes
- PM-KISAN, KCC Loan, PMFBY visibility
- Eligibility status per scheme
- One-click apply flow
- Credit score visualization
- Income vs expense bar chart

### 5. ⚙️ Role Switching
- Sidebar has a 4-role switcher for demo
- Each role sees its own navigation and pages
- Context manages role, auth and toast state

---

## 🔌 API Integration Guide

### Authentication (Firebase Auth)
```bash
npm install firebase
```
```js
// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPhoneNumber } from 'firebase/auth';

const app = initializeApp({ /* your config */ });
export const auth = getAuth(app);

// In Login.jsx:
const confirmationResult = await signInWithPhoneNumber(auth, `+91${phone}`, recaptchaVerifier);
const credential = await confirmationResult.confirm(otp.join(''));
```

### Claude API (Crop Diagnosis)
```bash
# Set in .env:
VITE_CLAUDE_KEY=sk-ant-...
```
```js
// Backend (Node/Express) — src/api/diagnose.js
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic();

app.post('/api/diagnose', upload.single('image'), async (req, res) => {
  const base64 = req.file.buffer.toString('base64');
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
        { type: 'text', text: 'Identify crop disease. Return JSON: { name, severity, treatment[], prevention, hindi_summary }' }
      ]
    }]
  });
  res.json(JSON.parse(message.content[0].text));
});
```

### OpenWeatherMap
```js
const APIKEY = import.meta.env.VITE_WEATHER_KEY;
const weather = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?q=Bhopal,IN&appid=${APIKEY}&units=metric`
);
```

### AGMARKNET (Mandi Prices)
```js
const prices = await fetch(
  `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${KEY}&format=json&filters%5Bstate%5D=Madhya+Pradesh`
);
```

### Google TTS (Hindi Voice — already working!)
```js
// Already implemented in CropDoctor.jsx using Web Speech API:
const utterance = new SpeechSynthesisUtterance(hindiText);
utterance.lang = 'hi-IN';
utterance.rate = 0.9;
window.speechSynthesis.speak(utterance);
```

---

## 📅 Hackathon Build Order (3 Days)

### Day 1 — AI Crop Doctor ✅
- [x] Project setup + dev server
- [x] Login page (OTP UI)
- [x] Home Dashboard (weather, alerts)
- [x] Crop Doctor (upload + scan animation)
- [x] Disease result + Hindi voice

### Day 2 — Mandi + Expert ✅
- [x] Mandi price table + sparklines
- [x] Add listing modal
- [x] Expert listing cards
- [x] Free demo booking flow

### Day 3 — Polish ✅
- [x] All 4 roles + navigation
- [x] Mobile responsive layout
- [x] Admin panel
- [x] README + documentation

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Upload dist/ to Vercel or:
npx vercel --prod
```

### Backend (Railway)
```bash
# Create server/index.js with Express
# Push to GitHub → connect to Railway
railway up
```

### Environment Variables
```env
VITE_CLAUDE_KEY=sk-ant-...
VITE_WEATHER_KEY=your_openweathermap_key
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_AGMARKNET_KEY=...
```

---

## 📊 Database Schema (Firestore)

```
users/{userId}
  ├── phone, name, village, district
  ├── landAcres, primaryCrops[]
  ├── role: 'farmer' | 'expert' | 'buyer'
  └── subscriptionTier

diagnoses/{diagnosisId}
  ├── userId, imageUrl, diseaseName
  ├── severity, treatmentPlan[], confidence
  └── resolved: bool

listings/{listingId}
  ├── farmerId, cropName, quantityKg
  ├── askingPrice, location, images[]
  └── status: 'active' | 'sold'

sessions/{sessionId}
  ├── expertId, farmerId
  ├── type: 'free' | 'paid'
  ├── scheduledAt, durationMin
  └── amountPaid, platformCut, rating

transactions/{txnId}
  ├── fromUser, toUser, type
  ├── amount, platformFee
  └── razorpayId, status
```

---

## 🛣️ Roadmap

- [ ] Real Claude API integration for diagnosis
- [ ] Firebase Auth OTP (production)
- [ ] AGMARKNET live price feed
- [ ] Labour GPS map view
- [ ] Drone booking with time slots
- [ ] In-app video call (Daily.co / Jitsi)
- [ ] Razorpay payment escrow
- [ ] PWA + offline mode (service worker)
- [ ] Multi-language (12 regional languages)
- [ ] Digital Twin farm model
- [ ] IoT sensor integration (soil, humidity)

---

## 🤝 Contributing

```bash
git clone https://github.com/your-org/krishi-mitra
cd krishi-mitra
npm install
npm run dev
```

---

## 📄 License

MIT © 2025 Krishi Mitra Team

---

*Built with ❤️ for India's 140 million farmers*
