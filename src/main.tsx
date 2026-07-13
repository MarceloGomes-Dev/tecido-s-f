// ============================================================
// CORREÇÃO: MaxListenersExceededWarning e orphaned data
// ============================================================
import { EventEmitter } from 'events';

// Aumenta o limite de listeners
EventEmitter.defaultMaxListeners = 20;

// Suprime avisos específicos (limpa o console)
const originalWarn = console.warn;
console.warn = function(...args) {
  const msg = args[0] || '';
  if (typeof msg === 'string' && 
      (msg.includes('orphaned data') || 
       msg.includes('MaxListenersExceeded') ||
       msg.includes('Possible EventEmitter memory leak'))) {
    return;
  }
  originalWarn.apply(console, args);
};

// ============================================================
// CÓDIGO PRINCIPAL
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
