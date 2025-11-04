import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole } from '../types';
import { getAllUsers } from '../services/api';
import { UsersIcon, CloseIcon } from './icons';

const UserList: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const allUsers = await getAllUsers();
                setUsers(allUsers);
            } catch (err) {
                console.error("Failed to fetch users for list", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const getPasswordForUser = (user: User) => {
        const nameParts = user.name.split(' ');
        if (nameParts.length < 2) return 'N/A';
        const [firstName, lastName] = nameParts;
        return `${firstName.substring(0, 2).toLowerCase()}${lastName.substring(0, 2).toLowerCase()}`;
    };

    const categorizedUsers = useMemo(() => {
        return {
            employees: users.filter(u => u.role === UserRole.EMPLOYEE),
            canteenAdmins: users.filter(u => u.role === UserRole.ADMIN),
            mainAdmins: users.filter(u => u.role === UserRole.MAIN_ADMIN),
        };
    }, [users]);
    
    const renderUserSection = (title: string, userList: User[]) => {
        if (userList.length === 0) return null;
        return (
            <div>
                <h3 className="text-lg font-bold text-primary border-b-2 border-primary-light pb-1 mb-2">{title}</h3>
                <ul className="space-y-2 text-xs">
                    {userList.map(user => (
                        <li key={user.id} className="p-2 bg-slate-100 rounded">
                            <p className="font-semibold text-slate-800">{user.name}</p>
                            <p className="text-slate-600 font-mono break-all">{user.email}</p>
                            <p className="text-slate-600">Password: <span className="font-mono font-bold text-secondary">{getPasswordForUser(user)}</span></p>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-[60] bg-primary text-onPrimary p-3 rounded-full shadow-lg hover:bg-primary-dark transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
                aria-label="Toggle user list"
            >
                {isOpen ? <CloseIcon /> : <UsersIcon />}
            </button>
            <div
                className={`fixed top-0 left-0 h-full bg-surface shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-72 max-w-[80vw]`}
            >
                <div className="p-4 pt-20 h-full overflow-y-auto">
                    <h2 className="text-xl font-bold text-onSurface mb-4">User Login Reference</h2>
                    {loading ? (
                        <p>Loading users...</p>
                    ) : (
                        <div className="space-y-4">
                            {renderUserSection('Main Admin / HR', categorizedUsers.mainAdmins)}
                            {renderUserSection('Canteen Admins', categorizedUsers.canteenAdmins)}
                            {renderUserSection('Employees', categorizedUsers.employees)}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserList;
