// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/marketing/LandingPage';
import AdminPanel from './features/admin/layout/AdminPanel';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Customer Side */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Admin Side */}
          <Route path="/admin" element={<AdminPanel />} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;