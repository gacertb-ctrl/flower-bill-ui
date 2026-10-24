import './i18n/config'; // <--- ADD THIS LINE
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const defaultToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpZCI6MSwidXNlcm5hbWUiOiJnYW50aGltYXRoaSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6Mn0.Q4x2rCrT53RSkUHJuQQjMp_Pr6EaUi2v302wZlKAbhY';
if (!localStorage.getItem('authToken')) {
  localStorage.setItem('authToken', defaultToken);
}

// Global helper: Clicking anywhere on a date input (or its immediate icon/wrapper) opens the date picker
document.addEventListener('click', (e) => {
  const target = e.target;
  let dateInput = null;

  if (target instanceof HTMLInputElement && target.type === 'date') {
    dateInput = target;
  } else if (target && typeof target.closest === 'function') {
    const parentContainer = target.closest(
      '.erp-gregorian-date-wrap, .welcome-date-badge, .filter-date-wrapper, .report-date-filter-wrap, .erp-dc-date-input, .report-date-input, .date-filter-box, .date-range-filter'
    );
    if (parentContainer) {
      dateInput = parentContainer.querySelector('input[type="date"]');
    }
  }

  if (dateInput && !dateInput.disabled && typeof dateInput.showPicker === 'function') {
    try {
      dateInput.showPicker();
    } catch (err) {
      // Ignore if browser already handled or blocked
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
