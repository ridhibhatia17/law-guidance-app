import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import ContractBreachForm from './components/ContractBreachForm';
import CaseTypeFinder from './components/CaseTypeFinder';
import GuidanceOutput from './components/GuidanceOutput';
import DisclaimerModal from './components/DisclaimerModal';
import { Scale, HelpCircle } from 'lucide-react';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [caseTypeResult, setCaseTypeResult] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab && location.pathname === '/') {
      window.location.href = savedTab;
    }
  }, [location]);

  const tabs = [
    { path: '/breach-analysis', label: 'Check Contract Issues', icon: Scale },
    { path: '/case-finder', label: 'Find Case Type', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-background-gray">
      {/* Header */}
      <header className="bg-card-bg shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Scale className="h-8 w-8 text-saffron" />
              <h1 className="text-2xl font-bold text-text-primary">Law Help India</h1>
            </div>
            <p className="text-sm text-text-secondary hidden md:block">
              Simple Legal Guidance for India
            </p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-card-bg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}
                  onClick={() => localStorage.setItem('activeTab', tab.path)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Input Forms */}
          <Routes>
            <Route path="/breach-analysis" element={
              <ContractBreachForm 
                onResult={setAnalysisResult}
                onShowDisclaimer={() => setShowDisclaimer(true)}
              />
            } />
            <Route path="/case-finder" element={
              <CaseTypeFinder 
                onResult={setCaseTypeResult}
                onShowDisclaimer={() => setShowDisclaimer(true)}
              />
            } />
            <Route path="*" element={<ContractBreachForm 
              onResult={setAnalysisResult}
              onShowDisclaimer={() => setShowDisclaimer(true)}
            />} />
          </Routes>

          {/* Results Below */}
          {(analysisResult || caseTypeResult) && (
            <GuidanceOutput 
              analysisResult={analysisResult}
              caseTypeResult={caseTypeResult}
              activeTab={location.pathname.replace('/', '')}
            />
          )}
        </div>
      </main>

      {/* Disclaimer Modal */}
      <DisclaimerModal 
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
      />
    </div>
  );
}

export default App;