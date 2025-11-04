import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { addUser, updateUser } from '../../services/api';
import { CloseIcon, UserIcon } from '../icons';

interface UserFormModalProps {
  userToEdit: User | null;
  onClose: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ userToEdit, onClose }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setRole(userToEdit.role);
    }
  }, [userToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.trim().split(' ').length < 2) {
      setError('Please enter a full name (first and last name).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (userToEdit) {
        // Edit existing user
        await updateUser(userToEdit.id, { name, role });
      } else {
        // Add new user
        await addUser({ name, role });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save user', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-form-title"
    >
      <div className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all" role="document">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-onSurface" id="user-form-title">
            {userToEdit ? 'Edit User' : 'Add New User'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            aria-label="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John Doe"
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value={UserRole.EMPLOYEE}>Employee</option>
              <option value={UserRole.ADMIN}>Canteen Admin</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="pt-2 flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400"
            >
              {isSubmitting ? 'Saving...' : 'Save User'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;