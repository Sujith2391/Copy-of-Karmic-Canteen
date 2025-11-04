import React from 'react';
import { User } from '../types';
import ConfirmationStats from './admin/ConfirmationStats';
import MenuManager from './admin/MenuManager';
import FeedbackViewer from './admin/FeedbackViewer';
import NotificationManager from './admin/NotificationManager';

interface AdminDashboardProps {
  user: User;
  activeView: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, activeView }) => {
  const renderContent = () => {
    switch (activeView) {
      case 'stats':
        return <ConfirmationStats />;
      case 'menu':
        return <MenuManager />;
      case 'feedback':
        return <FeedbackViewer />;
      case 'notifications':
        return <NotificationManager />;
      default:
        return <ConfirmationStats />;
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-onSurface">Admin Dashboard</h2>
        <p className="text-slate-500">Welcome, {user.name}. Manage canteen operations here.</p>
      </div>

      <div className="bg-surface p-6 rounded-xl shadow-lg min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
