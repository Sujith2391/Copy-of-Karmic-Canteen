import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import LoginScreen from './components/LoginScreen';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';
import MainAdminDashboard from './components/MainAdminDashboard';
import Header from './components/Header';
import UserList from './components/UserList';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('karmic-canteen-user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('karmic-canteen-user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('karmic-canteen-user');
  };
  
  const renderDashboard = () => {
    if (!currentUser) {
      return <LoginScreen onLogin={handleLogin} />;
    }
    
    switch (currentUser.role) {
      case UserRole.MAIN_ADMIN:
        return <MainAdminDashboard user={currentUser} />;
      case UserRole.ADMIN:
        return <AdminDashboard user={currentUser} />;
      case UserRole.EMPLOYEE:
        return <EmployeeDashboard user={currentUser} />;
      default:
         // Log out if role is unknown
        handleLogout();
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <UserList />
      {currentUser && <Header user={currentUser} onLogout={handleLogout} />}
      <main className="p-4 md:p-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default App;