// src/components/ui/PageLoader.jsx — Suspense fallback for lazy-loaded routes
import './LoadingState.css';

export default function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading...">
      <div className="page-loader__leaf">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 6C24 6,10 14,10 26C10 33.7,16.3 40,24 40C31.7 40,38 33.7,38 26C38 14,24 6,24 6Z"
            fill="var(--primary, #2D6A4F)"
            opacity="0.2"
            className="leaf-pulse"
          />
          <path
            d="M24 12 L24 38"
            stroke="var(--primary, #2D6A4F)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16 22 C16 22,20 18,24 20"
            stroke="var(--primary, #2D6A4F)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M32 26 C32 26,28 22,24 24"
            stroke="var(--primary, #2D6A4F)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      <p className="page-loader__text">Loading...</p>
    </div>
  );
}
