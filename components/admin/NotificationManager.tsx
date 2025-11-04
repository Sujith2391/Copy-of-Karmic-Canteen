import React, { useState, useEffect } from 'react';
import { Notification, User } from '../../types';
import { sendNotification, onNotificationsUpdate, onUsersUpdate } from '../../services/api';
import { BellIcon } from '../icons';

const NotificationManager: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [requiresAction, setRequiresAction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [pastNotifications, setPastNotifications] = useState<Notification[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const unsubNotifs = onNotificationsUpdate(setPastNotifications);
    const unsubUsers = onUsersUpdate(setAllUsers);
    return () => {
      unsubNotifs();
      unsubUsers();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please enter a title and a message.');
      return;
    }
    setIsSubmitting(true);
    try {
      await sendNotification({ title, message, requiresAction });
      setTitle('');
      setMessage('');
      setRequiresAction(false);
    } catch (error) {
      console.error('Failed to send notification', error);
      alert('Could not send notification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResponseCounts = (notification: Notification) => {
    if (!notification.requiresAction || !notification.responses) {
        return { yes: 0, no: 0, noResponse: 0 };
    }
    const yes = Object.values(notification.responses).filter(r => r === 'yes').length;
    const no = Object.values(notification.responses).filter(r => r === 'no').length;
    const employeeCount = allUsers.filter(u => u.role === 'employee').length;
    const noResponse = employeeCount - (yes + no);
    return { yes, no, noResponse };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-2xl font-bold mb-4 text-onSurface">Send a Notification</h3>
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-lg border space-y-4">
          <div>
            <label htmlFor="notif-title" className="block text-sm font-medium text-slate-700">Title</label>
            <input id="notif-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="notif-message" className="block text-sm font-medium text-slate-700">Message</label>
            <textarea id="notif-message" value={message} onChange={e => setMessage(e.target.value)} required rows={4} className="mt-1 w-full p-2 border rounded"></textarea>
          </div>
          <div className="flex items-center">
            <input id="notif-action" type="checkbox" checked={requiresAction} onChange={e => setRequiresAction(e.target.checked)} className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary" />
            <label htmlFor="notif-action" className="ml-2 block text-sm text-slate-900">Ask for a "Yes/No" response?</label>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-primary text-onPrimary font-semibold rounded-lg hover:bg-primary-dark disabled:bg-slate-400">
            {isSubmitting ? 'Sending...' : 'Send to All Employees'}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4 text-onSurface">Past Notifications</h3>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {pastNotifications.length > 0 ? pastNotifications.map(n => (
                <div key={n.id} className="bg-slate-50 p-4 rounded-lg border">
                    <p className="font-bold">{n.title}</p>
                    <p className="text-sm text-slate-600">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-2">{new Date(n.timestamp).toLocaleString()}</p>
                    {n.requiresAction && (
                        <div className="mt-2 pt-2 border-t text-sm flex space-x-4">
                           <span><span className="font-bold text-green-600">Yes:</span> {getResponseCounts(n).yes}</span>
                           <span><span className="font-bold text-red-600">No:</span> {getResponseCounts(n).no}</span>
                           <span><span className="font-bold text-slate-500">No Response:</span> {getResponseCounts(n).noResponse}</span>
                        </div>
                    )}
                </div>
            )) : <p className="text-slate-500">No notifications sent yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;
