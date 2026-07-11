// src/components/ErrorBoundary.jsx — Enhanced with Hindi fallback + structured logging
import React from 'react';
import './ErrorBoundary.css';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Structured error logging
    console.error(
      '%c[ErrorBoundary] Uncaught Error',
      'color: #DC2626; font-weight: bold',
      {
        message: error?.message,
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      }
    );
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container" role="alert">
          <div className="error-boundary-card glass-card">
            <div className="error-icon-wrapper">
              <AlertTriangle className="error-icon" size={48} />
            </div>
            <h2>Something went wrong</h2>
            <p className="hindi" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
              कुछ गलत हो गया — कृपया पेज रीलोड करें
            </p>
            <p>We encountered an unexpected error while rendering this page.</p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Technical Details</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={this.handleReload}>
                <RefreshCw size={20} />
                <span>Reload Page</span>
              </button>
              <button className="btn btn-secondary" onClick={this.handleGoHome}>
                🏠 <span>Go Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
