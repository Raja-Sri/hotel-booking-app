import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe global overrides for iframe sandboxing
if (typeof window !== 'undefined') {
  const originalConfirm = window.confirm;
  window.confirm = (message?: string) => {
    try {
      return originalConfirm(message);
    } catch (e) {
      console.warn("window.confirm blocked by iframe sandbox, automatically proceeding:", message);
      return true; // Auto-confirm inside preview iframe safely!
    }
  };

  const originalAlert = window.alert;
  window.alert = (message?: any) => {
    try {
      originalAlert(message);
    } catch (e) {
      console.warn("window.alert blocked by iframe sandbox:", message);
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

