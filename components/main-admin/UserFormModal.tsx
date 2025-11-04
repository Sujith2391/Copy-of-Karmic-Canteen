import React, { useState, useEffect } from 'react';
import { User, UserRole, WorkLocation } from '../../types';
import { registerUser, updateUser } from '../../services/api';
import { CloseIcon } from '../icons';

interface UserFormModalProps {
  userToEdit: User | null;
  onClose: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ userToEdit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    mobileNumber: '',
    role: UserRole.EMPLOYEE,
    workLocation: WorkLocation.MAIN_OFFICE,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(userToEdit);

  useEffect(() => {
    if (isEditing && userToEdit) {
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '', // Don't pre-fill password for security
        employeeId: userToEdit.employeeId,
        mobileNumber: userToEdit.mobileNumber,
        role: userToEdit.role,
        workLocation: userToEdit.workLocation,
      });
    } else {
        // Reset for new user form
        setFormData({
            name: '',
            email: '',
            password: '',
            employeeId: '',
            mobileNumber: '',
            role: UserRole.EMPLOYEE,
            workLocation: WorkLocation.MAIN_OFFICE,
        });
    }
  }, [userToEdit, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.employeeId || !formData.mobileNumber) {
        setError('Please fill in all required fields.');
        return;
    }
    
    if (!isEditing && !formData.password) {
        setError('Password is required for new users.');
        return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && userToEdit) {
        const updatedData: Partial<User> = {
          name: formData.name,
          email: formData.email.toLowerCase(),
          employeeId: formData.employeeId,
          mobileNumber: formData.mobileNumber,
          role: formData.role,
          workLocation: formData.workLocation,
        };
        if (formData.password) {
          updatedData.password = formData.password;
        }
        await updateUser(userToEdit.id, updatedData);
      } else {
        // Adding new user
        const newUser: Omit<User, 'id'> = {
            name: formData.name,
            email: formData.email.toLowerCase(),
            password: formData.password,
            employeeId: formData.employeeId,
            mobileNumber: formData.mobileNumber,
            role: formData.role,
            workLocation: formData.workLocation,
        };
        await registerUser(newUser);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-lg transform transition-all" role="document">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-onSurface">
            {isEditing ? 'Edit User' : 'Add New User'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Close">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? 'Leave blank to keep unchanged' : 'Required'} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700">Employee ID</label>
                <input type="text" id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" />
            </div>
            <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-slate-700">Mobile Number</label>
                <input type="tel" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm">
                    {Object.values(UserRole).map(role => (
                        <option key={role} value={role}>{role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="workLocation" className="block text-sm font-medium text-slate-700">Work Location</label>
                <select id="workLocation" name="workLocation" value={formData.workLocation} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm">
                    {Object.values(WorkLocation).map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                    ))}
                </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="pt-2 flex flex-col sm:flex-row-reverse gap-3">
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400">
              {isSubmitting ? 'Saving...' : 'Save User'}
            </button>
            <button type="button" onClick={onClose} className="w-full sm:w-auto inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
