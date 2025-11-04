import React, { useState, useEffect } from 'react';
import { User, UserRole, WorkLocation } from '../../types';
import { onUsersUpdate, deleteUser } from '../../services/api';
import UserFormModal from './UserFormModal';
import { UsersIcon, EditIcon, DeleteIcon } from '../icons';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onUsersUpdate((updatedUsers) => {
      setUsers(updatedUsers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error("Failed to delete user", error);
        alert("Could not delete user. Please try again.");
      }
    }
  };
  
  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
        case UserRole.MAIN_ADMIN: return 'Main Admin';
        case UserRole.ADMIN: return 'Canteen Admin';
        case UserRole.EMPLOYEE: return 'Employee';
        default: return 'Unknown';
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-onSurface flex items-center">
          <UsersIcon className="w-7 h-7 mr-2" />
          User Management
        </h3>
        <button
          onClick={openAddModal}
          className="px-4 py-2 font-semibold bg-primary text-onPrimary rounded-lg shadow hover:bg-primary-dark transition"
        >
          + Add User
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                     <div>ID: <span className="font-medium text-slate-700">{user.employeeId}</span></div>
                     <div>Loc: <span className="font-medium text-slate-700">{user.workLocation}</span></div>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === UserRole.MAIN_ADMIN ? 'bg-purple-100 text-purple-800' : user.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.role !== UserRole.MAIN_ADMIN && (
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => openEditModal(user)} className="p-2 text-primary hover:text-primary-dark rounded-full hover:bg-slate-100 transition" aria-label={`Edit ${user.name}`}>
                            <EditIcon />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-secondary hover:text-orange-700 rounded-full hover:bg-slate-100 transition" aria-label={`Delete ${user.name}`}>
                            <DeleteIcon />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <UserFormModal
          userToEdit={editingUser}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default UserManagement;
