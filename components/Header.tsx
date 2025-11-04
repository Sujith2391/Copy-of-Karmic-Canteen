import React from 'react';
import { User } from '../types';
import { LogoutIcon, UserIcon, BellIcon } from './icons';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  // A simple way to toggle the notification viewer.
  // In a larger app, this state would be managed by a context or state manager.
  const handleBellClick = () => {
    const viewer = document.getElementById('notification-viewer');
    if (viewer) {
      viewer.classList.toggle('hidden');
    }
  };

  return (
    <header className="bg-surface shadow-md print-hidden h-16 flex-shrink-0">
      <div className="container mx-auto px-4 md:px-8 h-full flex justify-end items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleBellClick}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            aria-label="Toggle notifications"
          >
            <BellIcon />
            {/* Notification dot can be added here */}
          </button>

          <div className="flex items-center space-x-2 text-onSurface">
            <UserIcon className="w-6 h-6 text-slate-500" />
            <span className="hidden sm:block font-medium">{user.name}</span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center px-3 py-2 text-sm font-semibold text-secondary bg-orange-100 rounded-lg hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition"
          >
            <LogoutIcon className="w-5 h-5 mr-1" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
