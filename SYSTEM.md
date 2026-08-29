# 🌾 KrishiMitra — Complete System Architecture & Implementation Manual (SYSTEM.md)

> **Document Version**: 2.1.0  
> **Platform**: KrishiMitra (कृषि Mitra) — AI-Powered AgriTech Ecosystem for Indian Farmers  
> **Tech Stack**: React 19, Vite 8, React Router v7, Firebase v12 (Auth + Firestore + Analytics), Pure Vanilla CSS Glassmorphism Design System, Web Speech API, PWA Service Worker.

---

## 📑 Table of Contents
1. [Executive Summary & Core Value Proposition](#1-executive-summary--core-value-proposition)
2. [Comprehensive End-to-End Implementation Breakdown](#2-comprehensive-end-to-end-implementation-breakdown)
   - [2.1 File & Directory Tree](#21-file--directory-tree)
   - [2.2 App Entry, Providers & Root Layout (`App.jsx`, `main.jsx`)](#22-app-entry-providers--root-layout-appjsx-mainjsx)
   - [2.3 State Management & Context Architecture (`AppContext.jsx`, `AuthContext.jsx`)](#23-state-management--context-architecture-appcontextjsx-authcontextjsx)
   - [2.4 Routing & Security Wrappers (`AppRouter.jsx`, `ProtectedRoute.jsx`, `RoleRoute.jsx`)](#24-routing--security-wrappers-approuterjsx-protectedroutejsx-roleroutejsx)
   - [2.5 Zero-Dependency Localization Engine (`src/i18n/`)](#25-zero-dependency-localization-engine-srci18n)
   - [2.6 Voice Assistant & Speech-to-Intent Pipeline (`VoiceAssistant.jsx`)](#26-voice-assistant--speech-to-intent-pipeline-voiceassistantjsx)
   - [2.7 Offline-First Data & Service Layer (`services/`)](#27-offline-first-data--service-layer-services)
   - [2.8 UI Design System & CSS Glassmorphism (`src/styles/`)](#28-ui-design-system--css-glassmorphism-srcstyles)
   - [2.9 Feature Pages & User Flows](#29-feature-pages--user-flows)
3. [Real-World Enterprise Production Blueprint (To-Be)](#3-real-world-enterprise-production-blueprint-to-be)
4. [Master Prompts for Cloud AI & Backend Engineering](#4-master-prompts-for-cloud-ai--backend-engineering)

---

## 1. Executive Summary & Core Value Proposition

KrishiMitra is designed specifically for rural Indian agriculture, catering to varying digital literacy levels, low-end mobile devices (Android Go, 2GB RAM), and spotty 2G/3G connectivity.

### Key Capabilities:
- **🔬 AI Crop Doctor**: Instant leaf diagnosis using Gemini 2.0 / Claude vision models, generating severity levels, structured chemical/organic treatment steps, and Hindi voice synthesis (`SpeechSynthesisUtterance`).
- **📈 Real-Time Mandi Bhav**: Commodity price monitor across MP districts with official MSP comparisons and price trend sparklines.
- **🛒 Direct Marketplace**: Buy/sell crop harvest with zero middleman commissions.
- **👷 Labour & Machinery Hire**: On-demand farm worker hiring and tractor/harvester rental calculator.
- **👨‍💼 Scientist & Expert Tele-Consultation**: Direct appointment booking with agricultural scientists.
- **💳 Rural FinTech & Subsidy Hub**: Kisan Credit Score gauge and 1-tap application for PM-KISAN, KCC, and PMFBY.
- **🌐 Bilingual & Voice-First**: Instant Hindi/English toggle and floating microphone voice assistant.
- **📴 Offline Resilience**: IndexedDB data caching and PWA service worker offline booting (<2MB).

---

## 2. Comprehensive End-to-End Implementation Breakdown

### 2.1 File & Directory Tree

```
krishi-mitra/
├── api/                           # Vercel Serverless Proxies (API key protection)
│   ├── plantnet.js                # PlantNet proxy
│   └── weather.js                 # WeatherAPI proxy
├── public/                        # Static assets, icons & manifest
│   ├── favicon.ico
│   ├── manifest.webmanifest       # PWA Install manifest
│   └── robots.txt
├── src/
│   ├── context/                   # Global State Layer
│   │   ├── AppContext.jsx         # UI, Toast, Active Route, Demo State
│   │   └── AuthContext.jsx        # Firebase Phone Auth & Session State
│   ├── i18n/                      # Zero-dependency Localization Engine
│   │   ├── en.json                # English strings dictionary
│   │   ├── hi.json                # Hindi strings dictionary
│   │   └── useTranslation.jsx     # I18nProvider + useTranslation hook
│   ├── pages/                     # Lazy-Loaded Route Views
│   │   ├── Login.jsx              # Phone OTP + Demo Authentication
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx # System overview, metrics & controls
│   │   │   └── SystemOverview.jsx # Service health & uptime
│   │   ├── buyer/
│   │   │   └── MarketplaceBrowse.jsx # Browse crops, filter organic/delivery
│   │   ├── expert/
│   │   │   └── ExpertDashboard.jsx # Consultations queue & prescriptions
│   │   ├── farmer/
│   │   │   ├── CropDoctor.jsx     # AI leaf scan, treatment & audio
│   │   │   ├── EquipmentRental.jsx# Tractors, tillers & harvesters
│   │   │   ├── ExpertConnect.jsx  # Scientist booking & consultations
│   │   │   ├── FarmProfile.jsx    # Soil health & crop inventory
│   │   │   ├── FinTech.jsx        # PM-KISAN, KCC & bookkeeping
│   │   │   ├── HomeDashboard.jsx  # Central dashboard hub
│   │   │   ├── LabourHire.jsx     # Farm worker hiring & job posting
│   │   │   ├── MarketplaceSell.jsx# List harvest & check Mandi rates
│   │   │   └── pages.css          # Shared styles for farmer views
│   │   └── worker/
│   │       ├── WorkerDashboard.jsx# Worker earnings & job discovery
│   │       └── WorkerRegistration.jsx # Skill onboarding & daily wage
│   ├── router/                    # Route Configuration & Guards
│   │   ├── AppRouter.jsx          # React Router v7 lazy routes
│   │   ├── ProtectedRoute.jsx     # Authentication guard
│   │   └── RoleRoute.jsx          # RBAC role guard (farmer/expert/buyer/admin/worker)
│   ├── services/                  # API, Firebase & Data Layer
│   │   ├── api/
│   │   │   ├── agmarknet.service.js # Live Mandi rates, MSPs & trends
│   │   │   ├── claude.service.js    # Multi-modal crop leaf vision
│   │   │   └── weather.service.js   # Agro-meteorological forecasts
│   │   └── firebase/
│   │       ├── auth.service.js    # Firebase Phone OTP & Recaptcha
│   │       ├── config.js          # Firebase init, IndexedDB persistence, Analytics
│   │       └── firestore.service.js # Typed CRUD for Firestore
│   ├── shared/                    # Reusable Utilities, Hooks & UI
│   │   ├── components/
│   │   │   ├── feedback/
│   │   │   │   ├── ErrorBoundary.jsx # Global error containment
│   │   │   │   └── LoadingState.jsx  # Glassmorphic skeleton loader
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx        # Top bar with weather & notifications
│   │   │   │   └── Sidebar.jsx       # Pinned sidebar with role switcher
│   │   │   └── ui/
│   │   │       ├── InstallPrompt.jsx # PWA "Add to Home Screen" banner
│   │   │       ├── Toast.jsx         # Custom glass toast alerts
│   │   │       └── VoiceAssistant.jsx# Floating speech recognition mic
│   │   ├── hooks/
│   │   │   ├── useDebounce.js
│   │   │   ├── useGeolocation.js
│   │   │   ├── useNetworkStatus.js   # Online/offline network detector
│   │   │   ├── useNotifications.js   # Real-time Firestore notifications
│   │   │   └── useWeather.js         # Dual-layer cached weather hook
│   │   └── utils/
│   │       ├── analytics.js          # Firebase Analytics event logger
│   │       ├── formatters.js         # INR currency & date formatting
│   │       ├── rateLimit.js          # Client-side throttling
│   │       └── sanitize.js           # XSS input sanitizer
│   ├── styles/                    # Design System
│   │   ├── animations.css         # Keyframe transitions & pulses
│   │   ├── components.css         # Buttons, cards, modals, layout
│   │   ├── global.css             # Entry stylesheet
│   │   ├── reset.css              # Box-sizing & default reset
│   │   └── variables.css          # Design tokens & color system
│   ├── App.jsx                    # Root App Shell
│   └── main.jsx                   # React 19 Root Entry
├── firestore.indexes.json         # Firestore compound query indexes
├── firestore.rules                # 195-line Security Rules (RBAC)
├── vite.config.js                 # Rollup chunking & PWA workbox setup
└── SYSTEM.md                      # System manual & specification
```

---

### 2.2 App Entry, Providers & Root Layout (`App.jsx`, `main.jsx`)

The root application encapsulates the entire component tree within three context providers:
1. **`BrowserRouter`**: React Router v7 DOM navigation.
2. **`I18nProvider`**: Provides language state (`hi` / `en`) with automatic `localStorage` persistence and updating `document.documentElement.lang`.
3. **`AppProvider`**: Composed state combining Authentication, Active Route, Toast Dispatcher, and Sidebar drawer state.

```jsx
// src/App.jsx (Architecture Overview)
export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AppProvider>
          <SkipLink />
          <MainLayout />
          <ToastContainer />
          <InstallPrompt />
          <VoiceAssistant />
        </AppProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
```

#### Layout Shell (`MainLayout`)
- When unauthenticated (`authStep === 'login'`), the login viewport is displayed full-screen without chrome.
- When authenticated:
  - `.app-container`: Flex container (`min-height: 100vh`) providing the App Shell.
  - `<Sidebar />`: Sticky 260px left sidebar with role switcher, navigation links, user pill, and language toggle.
  - `.main-content`: Flex column filling the viewport width.
  - `<Navbar />`: Sticky top header with weather badge, notification bell dropdown, and avatar.
  - `<main className="content-area">`: Houses `<ErrorBoundary>` wrapping lazy-loaded pages.
  - `<InstallPrompt />` & `<VoiceAssistant />`: Floating utilities accessible across all views.

---

### 2.3 State Management & Context Architecture (`AppContext.jsx`, `AuthContext.jsx`)

State management uses React Context + Custom Hooks without external heavyweight libraries (Redux/Zustand), maintaining a sub-1MB bundle:

- **`AuthContext.jsx`**:
  - Subscribes to Firebase `onAuthStateChanged`.
  - Manages `firebaseUser`, `demoRole` (`farmer` | `expert` | `buyer` | `worker` | `admin`), and session persistence.
  - Provides `loginWithOTP()`, `verifyPhoneOTP()`, `logout()`, and `handleAuthSuccess()`.
  - Includes a fast **Demo Mode bypass** for presentations and testing.

- **`AppContext.jsx`**:
  - Manages UI state: `activeRoute`, `sidebarOpen`, and active `toast` notifications.
  - Exposes `showToast(msg, type)` and `clearToast()`.

---

### 2.4 Routing & Security Wrappers (`AppRouter.jsx`, `ProtectedRoute.jsx`, `RoleRoute.jsx`)

All 15 application views are code-split using `React.lazy()`:
- **`ProtectedRoute.jsx`**: Redirects unauthenticated users to `/login`.
- **`RoleRoute.jsx`**: Enforces Role-Based Access Control (RBAC). If a Farmer navigates to `/admin`, they are redirected to `/dashboard`.
- **`AppRouter.jsx`**: Synchronizes browser URL paths to `activeRoute` and automatically logs `page_view` analytics on every transition.

```jsx
// Route Mapping Matrix:
// /dashboard, /crop-doctor, /marketplace-sell, /labour-hire, /equipment-rent, /expert-connect, /fintech, /farm-profile -> Farmer
// /marketplace-browse, /orders -> Buyer
// /expert-home, /sessions, /earnings -> Expert
// /worker-dashboard, /worker-register -> Worker
// /admin, /system-overview -> Admin
```

---

### 2.5 Zero-Dependency Localization Engine (`src/i18n/`)

- Built from scratch in [`useTranslation.jsx`](file:///c:/Users/Shiva%20Raghuwanshi/Documents/krishi-mitra/src/i18n/useTranslation.jsx) with JSON locale dictionaries ([`hi.json`](file:///c:/Users/Shiva%20Raghuwanshi/Documents/krishi-mitra/src/i18n/hi.json), [`en.json`](file:///c:/Users/Shiva%20Raghuwanshi/Documents/krishi-mitra/src/i18n/en.json)).
- **Dot-Notation Key Resolution**: `t('marketplace.price')` resolves `hi.json.marketplace.price`.
- **Graceful Fallback**: If a key is missing in Hindi, it automatically falls back to English.
- **Language Switches**: Located on both the Login screen and Sidebar footer.

---

### 2.6 Voice Assistant & Speech-to-Intent Pipeline (`VoiceAssistant.jsx`)

- Floating FAB button with pulse animation when listening.
- Uses `window.webkitSpeechRecognition` with language set dynamically (`hi-IN` / `en-IN`).
- **Intent Pattern Matcher**:
  - *"फ़सल डॉक्टर"* / *"Crop Doctor"* / *"Bimari"* ➔ Navigates to `/crop-doctor` + speaks confirmation in Hindi.
  - *"मंडी भाव"* / *"Mandi price"* / *"Becho"* ➔ Navigates to `/marketplace-sell`.
  - *"मौसम"* / *"Weather"* / *"Barish"* ➔ Speaks live temperature and rain conditions aloud via `window.speechSynthesis`.
  - *"मज़दूर"* / *"Labour"* ➔ Navigates to `/labour-hire`.
  - *"ट्रैक्टर"* / *"Equipment"* ➔ Navigates to `/equipment-rent`.
  - *"ऋण"* / *"Loan"* ➔ Navigates to `/fintech`.

---

### 2.7 Offline-First Data & Service Layer (`services/`)

1. **`firebase/config.js`**:
   - Initializes Firebase App, Auth, Firestore, and Analytics.
   - Activates `enableIndexedDbPersistence(db)` to cache all Firestore documents locally in IndexedDB.
2. **`api/weather.service.js`**:
   - Calls WeatherAPI via browser geolocation or fallback city.
   - Dual-layer cache: in-memory `_cachedWeather` + `localStorage` TTL fallback.
   - Automatically computes a guaranteed 6-day weather strip.
3. **`api/agmarknet.service.js`**:
   - Manages live Mandi commodity prices, MSP benchmarks, and trends across Madhya Pradesh.
   - Caches rates in `localStorage` with 1-hour TTL.
4. **`api/claude.service.js`**:
   - Sends base64 crop image to vision model with strict JSON schema response (`name`, `severity`, `confidence`, `treatment`, `prevention`, `hindiVoice`).
   - Includes offline demo disease presets (*Wheat Rust, Rice Blast, Tomato Leaf Curl*).

---

### 2.8 UI Design System & CSS Glassmorphism (`src/styles/`)

- **Strict Custom Tokens (`variables.css`)**:
  - Forest Green Palette: `--green-900: #1B4332`, `--green-800: #2D6A4F`, `--green-600: #52B788`, `--green-200: #D8F3DC`, `--green-50: #F8FFF8`.
  - Glassmorphic Tokens: `--bg-glass: rgba(255, 255, 255, 0.72)`, `backdrop-filter: blur(16px)`.
  - Depth System: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-card-hover`.
- **Zero Tailwind / No External UI Component Libraries**: Ensures maximum CSS performance, pure vanilla control, and zero bloated runtime bundles.

---

### 2.9 Feature Pages & User Flows

#### A. Home Dashboard (`HomeDashboard.jsx`)
- **Hero Banner**: Live season indicator (*"खरीफ सीजन 2026"*), personalized greeting, rotating advisory ticker (*Water management, Pest prevention, Mandi swings*), and weather snapshot.
- **Micro-Climate Stat Cards**: Temperature, Humidity, Wind Speed, UV Index.
- **Quick Services Command Center**: 6 cards linking to core tools.
- **Live Mandi Prices (MP)**: Real-time price list with trend badges and one-click *"Sell / बेचें"* buttons.
- **6-Day Forecast Strip**: Weather cards with high/low temperatures.
- **Crop Health Monitor**: Field-by-field health ratings with progress bars.
- **Farm Alerts**: Weather warnings, sowing windows, and subsidy deadlines.

#### B. Crop Doctor AI (`CropDoctor.jsx`)
- Upload leaf photos via drag-and-drop or camera capture.
- Real-time scanning animation with laser scan line.
- Diagnosis result card with disease name, severity badge, confidence meter, tabbed treatment/prevention steps, and Hindi voice synthesis.

#### C. Marketplace (`MarketplaceSell.jsx` & `MarketplaceBrowse.jsx`)
- Farmers list harvest with quantity, asking price, and location.
- Live Mandi price comparison table with MSP benchmarks.
- Buyers can browse listings, filter by organic certification or delivery options, and place orders.

#### D. Labour Hire & Equipment Rental (`LabourHire.jsx` & `EquipmentRental.jsx`)
- Post farm jobs, specify required skills, daily wage, and duration.
- View available workers and tractor/harvester machinery for rent.

#### E. Expert Connect (`ExpertConnect.jsx`)
- Verified agricultural scientist profiles with ratings, experience, and languages.
- Instant 15-minute free demo booking with selectable time slots.

#### F. Rural FinTech (`FinTech.jsx`)
- Kisan Credit Score meter (300 - 900).
- 1-click application for PM-KISAN, KCC, PMFBY, and Soil Health Card.
- 5-month farm income vs. expense visual bookkeeping bar chart.

---

## 3. Real-World Enterprise Production Blueprint (To-Be)

```
[ Rural Farmer (Android APK / PWA) ]
                │
                ▼ (Bhashini AI / HTTPS / WebSockets)
[ Cloud Load Balancer (Cloudflare / GCP Cloud Armor) ]
                │
    ┌───────────┴───────────┐
    ▼                       ▼
[ Node.js / FastAPI ]   [ LiveKit / WebRTC ] (Video Consultations)
(Microservices Backend)     │
    │                       ▼
    ├── Redis (Mandi Cache & Rate Limiting)
    ├── PostgreSQL + TimescaleDB (Mandi Historical Data)
    ├── Firebase Firestore (Real-Time Subscriptions & Chat)
    └── Cloud Storage (Encrypted Crop Scan Images)
```

---

## 4. Master Prompts for Cloud AI & Backend Engineering

### 📋 Master Prompt 1: Full Backend & Data Pipeline Generation
```text
You are a Principal Cloud Architect and Senior Full-Stack Engineer.
Convert the KrishiMitra AgriTech frontend (React 19 + Vite 8) into an enterprise production system.

Requirements:
1. Build a modular FastAPI / Express TypeScript backend with PostgreSQL, Prisma ORM, and Redis.
2. Implement endpoints:
   - GET /api/v1/mandi/prices: Live Data.gov.in Agmarknet API ingestion with 1-hour Redis cache and trend analysis.
   - GET /api/v1/weather/agro: Hyper-local agro-meteorological data (soil moisture, precipitation probability, spray index).
   - POST /api/v1/crop-doctor/diagnose: Multi-modal vision pipeline with disease severity and treatment recommendations.
   - POST /api/v1/payments/escrow: Razorpay / Cashfree UPI escrow payment webhooks.
   - POST /api/v1/consultations/room: LiveKit WebRTC room token generation.
3. Provide Dockerfile, docker-compose.yml, environment variable schemas, and database seed scripts.
```

### 📋 Master Prompt 2: Native Android APK & Bhashini Voice Integration
```text
You are a Senior Mobile AI Engineer.
1. Wrap the KrishiMitra PWA with Capacitor.js / Android Studio to output an Android APK (<10MB) optimized for Android Go devices.
2. Integrate Government of India Bhashini ASR/TTS API pipeline for seamless spoken Hindi, Marathi, Punjabi, Gujarati, and Telugu.
3. Configure SQLite offline database caching and background WorkManager synchronization.
```
