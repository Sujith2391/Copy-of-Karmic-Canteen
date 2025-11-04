import React, { useState, useEffect } from 'react';
import { Notification, User, UserRole, WorkLocation } from '../types';
import { onNotificationsUpdate, respondToNotification, onWorkPlanUpdateForDate } from '../services/api';
import { BellIcon, CloseIcon } from './icons';

interface NotificationViewerProps {
    user: User;
}

const NotificationViewer: React.FC<NotificationViewerProps> = ({ user }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [shouldReceive, setShouldReceive] = useState(false);

    useEffect(() => {
        if (user.role !== UserRole.EMPLOYEE) {
            setShouldReceive(false);
            return;
        }

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDateString = tomorrow.toISOString().split('T')[0];

        // Listen for changes to tomorrow's work plan
        const unsub = onWorkPlanUpdateForDate(user.id, tomorrowDateString, (plan) => {
            // Use tomorrow's plan if set, otherwise fall back to default location
            const effectiveLocation = plan ? plan.location : user.workLocation;
            setShouldReceive(effectiveLocation === WorkLocation.MAIN_OFFICE);
        });

        return () => unsub();
    }, [user.id, user.role, user.workLocation]);

    useEffect(() => {
        if (shouldReceive) {
            const unsub = onNotificationsUpdate(setNotifications);
            return () => unsub();
        }
    }, [shouldReceive]);
    
    useEffect(() => {
        const bell = document.querySelector('[aria-label="Toggle notifications"]');
        const handleToggle = () => setIsOpen(prev => !prev);
        
        if (bell) bell.addEventListener('click', handleToggle);
        
        return () => {
            if (bell) bell.removeEventListener('click', handleToggle);
        };
    }, []);

    const handleResponse = async (notifId: string, response: 'yes' | 'no') => {
        try {
            await respondToNotification(notifId, user.id, response);
        } catch (error) {
            console.error("Failed to send response", error);
        }
    };
    
    if (!shouldReceive) return null;

    return (
        <div id="notification-viewer" className={`fixed top-0 right-0 h-full bg-surface shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-80 max-w-[90vw]`}>
            <div className="p-4 pt-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-onSurface">Notifications</h2>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3">
                    {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id} className="bg-slate-50 p-3 rounded-lg border">
                            <p className="font-semibold text-onSurface">{n.title}</p>
                            <p className="text-sm text-slate-700">{n.message}</p>
                            <p className="text-xs text-slate-400 mt-2">{new Date(n.timestamp).toLocaleString()}</p>
                            {n.requiresAction && (
                                <div className="mt-3 pt-3 border-t flex gap-2">
                                    {n.responses?.[user.id] ? (
                                        <p className="text-sm font-semibold">Your response: <span className="uppercase">{n.responses[user.id]}</span></p>
                                    ) : (
                                        <>
                                            <button onClick={() => handleResponse(n.id, 'yes')} className="flex-1 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200">Yes</button>
                                            <button onClick={() => handleResponse(n.id, 'no')} className="flex-1 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200">No</button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )) : <p className="text-slate-500 text-sm p-4 text-center">No new notifications.</p>}
                </div>
            </div>
        </div>
    );
};

export default NotificationViewer;
