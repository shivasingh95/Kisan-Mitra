import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AppRouter from './router/AppRouter';

// Layout Components
import Navbar from './shared/components/layout/Navbar';
import Sidebar from './shared/components/layout/Sidebar';
import ToastComponent from './shared/components/ui/Toast';
import ErrorBoundary from './shared/components/feedback/ErrorBoundary';

// Layout CSS (not covered by global.css imports)
import './shared/components/layout/Navbar.css';
import './shared/components/layout/Sidebar.css';
import './shared/components/feedback/ErrorBoundary.css';

function ToastContainer() {
  const { toast, clearToast } = useApp();
  return <ToastComponent toast={toast} onDismiss={clearToast} />;
}

function MainLayout() {
  const { authStep, sidebarOpen } = useApp();

  if (authStep === 'login' || authStep === 'otp' || authStep === 'onboarding') {
    return <AppRouter />;
  }

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="content-area" id="main-content" tabIndex="-1">
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <MainLayout />
        <ToastContainer />
      </AppProvider>
    </BrowserRouter>
  );
}