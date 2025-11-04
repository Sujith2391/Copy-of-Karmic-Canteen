import React, { useState } from 'react';
import { User } from '../types';
import { UserIcon } from './icons';
import { loginUser } from '../services/api';
import Logo from './Logo';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
    }

    try {
        const matchedUser = await loginUser(email, password);
        if (matchedUser) {
          onLogin(matchedUser);
        } else {
          setError('Invalid email or password. Please try again.');
        }
    } catch (err) {
        console.error("Login failed", err);
        setError("An error occurred during login. Please try again later.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="mb-8">
        <Logo className="h-12 w-auto" />
      </div>
      <div className="w-full max-w-md p-8 space-y-6 bg-surface rounded-2xl shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-center text-onSurface">Canteen Portal Login</h2>
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
                    placeholder="your.name@karmic.co.in"
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <button onClick={onSwitchToRegister} className="font-medium text-primary hover:text-primary-dark">
                Register here
            </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;