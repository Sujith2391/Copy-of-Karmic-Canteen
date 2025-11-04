import React, { useState, useEffect } from 'react';
import { User, WorkLocation } from '../types';
import { getConfirmationsForWeek } from '../services/api';
import { BellIcon, CloseIcon } from './icons';

interface MealSelectionReminderProps {
  user: User;
  simulatedTime: { hour: number; minute: number };
}

const MealSelectionReminder: React.FC<MealSelectionReminderProps> = ({ user, simulatedTime }) => {
  const [showReminder, setShowReminder] = useState(false);
  const [hasConfirmedForTomorrow, setHasConfirmedForTomorrow] = useState(true); // Assume confirmed initially

  useEffect(() => {
    const checkConfirmationForTomorrow = async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekStart = new Date(tomorrow);
      weekStart.setDate(tomorrow.getDate() - tomorrow.getDay() + 1);

      try {
        const confirmations = await getConfirmationsForWeek(user.id, weekStart);
        const tomorrowConfirmation = confirmations[tomorrow.toISOString().split('T')[0]];
        if (tomorrowConfirmation) {
          const hasSelectedAnyMeal = tomorrowConfirmation.Breakfast || tomorrowConfirmation.Lunch || tomorrowConfirmation.Snacks || tomorrowConfirmation.Dinner;
          setHasConfirmedForTomorrow(hasSelectedAnyMeal);
        } else {
          setHasConfirmedForTomorrow(false);
        }
      } catch (error) {
        console.error("Could not check tomorrow's confirmation", error);
      }
    };
    
    // Check once when component mounts or user changes
    checkConfirmationForTomorrow();
  }, [user.id]);
  
  useEffect(() => {
    const shouldShow =
      user.workLocation === WorkLocation.MAIN_OFFICE &&
      simulatedTime.hour === 12 &&
      simulatedTime.minute >= 30 &&
      !hasConfirmedForTomorrow;
    
    setShowReminder(shouldShow);
  }, [simulatedTime, user.workLocation, hasConfirmedForTomorrow]);

  if (!showReminder) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <BellIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-onSurface">Meal Selection Reminder</h3>
            </div>
          </div>
          <button
            onClick={() => setShowReminder(false)}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="mb-4 text-slate-600">
          Are you working from home today? Have you changed your work location? If not, please register for tomorrow's meals before the 12:30 PM deadline.
        </p>
        <button
          onClick={() => setShowReminder(false)}
          className="w-full px-4 py-2 bg-primary text-onPrimary font-semibold rounded-lg shadow-md hover:bg-primary-dark"
        >
          Got It
        </button>
      </div>
    </div>
  );
};

export default MealSelectionReminder;
