import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Users, RefreshCw, FileText, Shield, DollarSign } from 'lucide-react';
import Overview from './pages/Overview';
import PremiumCollection from './pages/PremiumCollection';
import AgencyAnalytics from './pages/AgencyAnalytics';
import RenewalTracking from './pages/RenewalTracking';
import PolicyAnalysis from './pages/PolicyAnalysis';
import ClaimsManagement from './pages/ClaimsManagement';
import Investments from './pages/Investments';

function App() {
  const [activeNav, setActiveNav] = useState('/');

  const navItems = [
    { path: '/', label: 'Dashboard Overview', icon: LayoutDashboard },
    { path: '/premium', label: 'Premium Collection', icon: TrendingUp },
    { path: '/agents', label: 'Agency Analytics', icon: Users },
    { path: '/renewals', label: 'Renewal Tracking', icon: RefreshCw },
    { path: '/policies', label: 'Policy Analysis', icon: FileText },
    { path: '/claims', label: 'Claims Management', icon: Shield },
    { path: '/investments', label: 'Investments', icon: DollarSign },
  ];

  return (
    <Router>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1>🏔️ Nepal Insurance</h1>
            <p>Dashboard System</p>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.path}
                  className={`nav-item ${activeNav === item.path ? 'active' : ''}`}
                  onClick={() => {
                    setActiveNav(item.path);
                  }}
                >
                  <Icon />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/premium" element={<PremiumCollection />} />
            <Route path="/agents" element={<AgencyAnalytics />} />
            <Route path="/renewals" element={<RenewalTracking />} />
            <Route path="/policies" element={<PolicyAnalysis />} />
            <Route path="/claims" element={<ClaimsManagement />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
