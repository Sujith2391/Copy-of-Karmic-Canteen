import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getAllUsers } from '../services/api';
import { UsersIcon, CloseIcon } from './icons';

const UserList: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && users.length === 0) {
      setLoading(true);
      getAllUsers()
        .then(setUsers)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, users.length]);

  const renderUserSection = (title: string, role: UserRole) => {
    const filteredUsers = users.filter(u => u.role === role);
    if (filteredUsers.length === 0) return null;

    return (
      <div>
        <h3 className="text-lg font-bold text-primary my-2">{title}</h3>
        <ul className="space-y-2">
          {filteredUsers.map(user => (
            <li key={user.id} className="text-sm p-2 bg-slate-100 rounded">
              <p className="font-semibold text-onSurface">{user.name}</p>
              <p className="text-slate-600">{user.email}</p>
              <p className="text-slate-500 font-mono">Pass: <span className="font-bold text-secondary">{user.password}</span></p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 p-3 bg-primary text-onPrimary rounded-full shadow-lg hover:bg-primary-dark transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
        aria-label="Show user login credentials"
      >
        <UsersIcon className="w-6 h-6" />
      </button>
      
      <div 
        className={`fixed top-0 right-0 h-full bg-surface shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-80 max-w-[90vw]`}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 pt-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-onSurface">User Login Reference</h2>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
              <CloseIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <div className="space-y-4">
                {renderUserSection('Employees', UserRole.EMPLOYEE)}
                {renderUserSection('Canteen Admins', UserRole.ADMIN)}
                {renderUserSection('Main Admin', UserRole.MAIN_ADMIN)}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserList;