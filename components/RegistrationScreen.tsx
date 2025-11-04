import React, { useState } from 'react';
import { registerUser } from '../services/api';
import { User, UserRole, WorkLocation } from '../types';
import Logo from './Logo';

interface RegistrationScreenProps {
  onRegisterSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.toLowerCase().endsWith('@karmic.co.in')) {
      setError('Please use a valid Karmic email address (e.g., your.name@karmic.co.in).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!name.trim() || !employeeId.trim() || !mobileNumber.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const newUser: Omit<User, 'id'> = {
      email: email.toLowerCase(),
      password, // In a real app, this would be hashed client-side or sent over HTTPS to be hashed server-side.
      name,
      employeeId,
      mobileNumber,
      role: UserRole.EMPLOYEE,
      workLocation: WorkLocation.MAIN_OFFICE, // Default location
    };

    try {
      const registeredUser = await registerUser(newUser);
      onRegisterSuccess(registeredUser);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface rounded-2xl shadow-lg">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-center text-onSurface">Create Your Account</h2>
          <p className="mt-2 text-center text-slate-500">Join the Karmic Canteen portal.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Form Fields */}
          <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          <input type="email" placeholder="Email (@karmic.co.in)" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          <input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={e => setPassword(e.target.value)} required className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          <input type="text" placeholder="Employee ID" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          <input type="tel" placeholder="Mobile Number" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center px-4 py-3 font-semibold text-onPrimary bg-primary rounded-lg shadow-md hover:bg-primary-dark disabled:bg-slate-400">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="font-medium text-primary hover:text-primary-dark">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegistrationScreen;