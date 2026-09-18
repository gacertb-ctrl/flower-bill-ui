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
