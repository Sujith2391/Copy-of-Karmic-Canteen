import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import LoginScreen from './components/LoginScreen';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';
import MainAdminDashboard from './components/MainAdminDashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import WasteAnalysisPage from './components/WasteAnalysisPage';
import RegistrationScreen from './components/RegistrationScreen';
import NotificationViewer from './components/NotificationViewer';
import UserList from './components/UserList';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showWasteAnalysis, setShowWasteAnalysis] = useState(false);
  const [adminView, setAdminView] = useState('stats');
  const [view, setView] = useState<'login' | 'register' | 'app'>('login');

  useEffect(() => {
    const storedUser = localStorage.getItem('karmic-canteen-user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setView('app');
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('karmic-canteen-user', JSON.stringify(user));
    setView('app');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowWasteAnalysis(false);
    setAdminView('stats');
    localStorage.removeItem('karmic-canteen-user');
    setView('login');
  };

  const handleAdminNavigate = (view: string) => {
    setShowWasteAnalysis(false);
    setAdminView(view);
  };

  const handleToggleWasteAnalysis = () => {
    if (showWasteAnalysis) {
        setShowWasteAnalysis(false);
        setAdminView('stats');
    } else {
        setShowWasteAnalysis(true);
    }
  };

  const renderContent = () => {
    if (view !== 'app' || !currentUser) {
      if (view === 'register') {
        return <RegistrationScreen onRegisterSuccess={handleLogin} onSwitchToLogin={() => setView('login')} />;
      }
      return <LoginScreen onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />;
    }
    
    return (
      <>
        <NotificationViewer user={currentUser} />
        <div className="min-h-screen bg-background font-sans flex">
          <Sidebar 
              user={currentUser} 
              adminView={adminView} 
              onAdminNavigate={handleAdminNavigate}
              onToggleWasteAnalysis={handleToggleWasteAnalysis}
              isAnalysisPageVisible={showWasteAnalysis}
          />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Header user={currentUser} onLogout={handleLogout} />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              {showWasteAnalysis 
                ? <WasteAnalysisPage onBack={() => { setShowWasteAnalysis(false); setAdminView('stats'); }} />
                : (() => {
                    switch (currentUser.role) {
                      case UserRole.MAIN_ADMIN:
                        return <MainAdminDashboard user={currentUser} />;
                      case UserRole.ADMIN:
                        return <AdminDashboard user={currentUser} activeView={adminView} />;
                      case UserRole.EMPLOYEE:
                        return <EmployeeDashboard user={currentUser} />;
                      default:
                        handleLogout();
                        return null;
                    }
                })()
              }
            </main>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {renderContent()}
      <UserList />
    </>
  );
};

export default App;