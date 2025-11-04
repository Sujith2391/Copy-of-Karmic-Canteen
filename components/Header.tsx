
import React from 'react';
import { User } from '../types';
import { LogoutIcon, UserIcon } from './icons';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-surface shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Karmic Canteen</h1>
        <div className="flex items-center space-x-4">
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
