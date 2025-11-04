import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { UserIcon } from './icons';
import { getAllUsers } from '../services/api';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const userData = await getAllUsers();
        setAllUsers(userData);
      } catch (error) {
        console.error("Failed to fetch users", error);
        setError("Could not load user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
        setError('Please enter both email and password.');
        return;
    }

    const lowerCaseEmail = email.toLowerCase();
    
    const matchedUser = allUsers.find(user => {
        if (!user.email) return false;

        const nameParts = user.name.split(' ');
        if (nameParts.length < 2) return false;
        
        const [firstName, lastName] = nameParts;
        
        const expectedPassword = `${firstName.substring(0, 2).toLowerCase()}${lastName.substring(0, 2).toLowerCase()}`;

        return lowerCaseEmail === user.email.toLowerCase() && password === expectedPassword;
    });

    if (matchedUser) {
      onLogin(matchedUser);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-2xl shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-center text-primary">Karmic Canteen</h1>
          <p className="mt-2 text-center text-slate-500">Mindful eating, zero waste.</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleLoginSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
            </label>
            <div className="mt-1">
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="firstname.lastname@karmic.com"
                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    aria-label="Email Address"
                />
            </div>
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-slate-700">
                Password
            </label>
            <div className="mt-1">
                 <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    aria-label="Password"
                />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 font-semibold text-onPrimary bg-primary rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed"
          >
            <UserIcon className="w-5 h-5 mr-2" />
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;