import React from 'react'
import { createRoot } from 'react-dom/client'
import { Toast } from './components/toast';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <>
    <App />
    <Toast />
  </>
);
