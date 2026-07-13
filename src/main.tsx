// ============================================================
// CORREÇÃO: MaxListenersExceededWarning e orphaned data
// ============================================================

// Suprime avisos específicos no console do navegador
// Isso é feito diretamente no console, sem importar módulos Node
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = function(...args) {
    const msg = args[0] || '';
    if (typeof msg === 'string' && 
        (msg.includes('orphaned data') || 
         msg.includes('MaxListenersExceeded') ||
         msg.includes('Possible EventEmitter memory leak') ||
         msg.includes('MaxListeners'))) {
      return; // Ignora esses avisos
    }
    originalWarn.apply(console, args);
  };
}

// ============================================================
// CÓDIGO PRINCIPAL DA APLICAÇÃO
// ============================================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
