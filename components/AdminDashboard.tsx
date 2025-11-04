
import React, { useState } from 'react';
import { User } from '../types';
import ConfirmationStats from './admin/ConfirmationStats';
import MenuManager from './admin/MenuManager';
import WasteChart from './admin/WasteChart';
import { StatsIcon, MenuIcon, ChartIcon } from './icons';

interface AdminDashboardProps {
  user: User;
}

type Tab = 'stats' | 'menu' | 'analytics';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<Tab>('stats');

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <ConfirmationStats />;
      case 'menu':
        return <MenuManager />;
      case 'analytics':
        return <WasteChart />;
      default:
        return null;
    }
  };
  
  const TabButton = ({ tab, icon, label }: { tab: Tab, icon: React.ReactNode, label: string}) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-3 font-semibold rounded-lg transition ${
        activeTab === tab 
        ? 'bg-primary text-onPrimary shadow-md' 
        : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-onSurface">Admin Dashboard</h2>
        <p className="text-slate-500">Welcome, {user.name}. Manage canteen operations here.</p>
      </div>

      <div className="bg-surface p-2 rounded-xl shadow-sm flex space-x-2">
        <TabButton tab="stats" icon={<StatsIcon className="w-5 h-5"/>} label="Live Stats" />
        <TabButton tab="menu" icon={<MenuIcon className="w-5 h-5"/>} label="Menu Management" />
        <TabButton tab="analytics" icon={<ChartIcon className="w-5 h-5"/>} label="Waste Analytics" />
      </div>

      <div className="bg-surface p-6 rounded-xl shadow-lg min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
