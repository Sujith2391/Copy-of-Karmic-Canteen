import React, { useState } from 'react';
import { MealType, MenuItem, MealConfirmation, User } from '../types';
import { BreakfastIcon, LunchIcon, SnackIcon, DinnerIcon } from './icons';
import { updateConfirmation } from '../services/api';
import FeedbackModal from './FeedbackModal';

interface MenuCardProps {
  mealType: MealType;
  items: MenuItem[];
  confirmation: MealConfirmation;
  onConfirmChange: (date: string, mealType: MealType, status: boolean) => void;
  user: User;
  date: Date;
  simulatedTime: { hour: number, minute: number };
}

const mealInfo: Record<MealType, { icon: React.FC<{className?: string}>, time: string }> = {
  [MealType.BREAKFAST]: { icon: BreakfastIcon, time: '8:30 AM – 10:00 AM' },
  [MealType.LUNCH]: { icon: LunchIcon, time: '1:00 PM – 2:30 PM' },
  [MealType.SNACKS]: { icon: SnackIcon, time: '5:00 PM – 6:30 PM' },
  [MealType.DINNER]: { icon: DinnerIcon, time: '8:00 PM – 9:30 PM' },
};

const MenuCard: React.FC<MenuCardProps> = ({ mealType, items, confirmation, onConfirmChange, user, date, simulatedTime }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  
  const { icon: Icon, time } = mealInfo[mealType];
  const isOptedIn = confirmation ? confirmation[mealType] : false;
  
  const isPastDeadline = () => {
    const now = new Date();
    now.setHours(simulatedTime.hour, simulatedTime.minute, 0, 0);

    const deadline = new Date(date);
    deadline.setHours(12, 30, 0, 0); // Deadline is 12:30 PM of the meal day
    deadline.setDate(deadline.getDate() - 1); // on the *previous* day.

    return now > deadline;
  };

  const handleToggleConfirmation = async () => {
    if (isPastDeadline()) return;
    setIsUpdating(true);
    try {
      const dateString = date.toISOString().split('T')[0];
      await updateConfirmation(user.id, dateString, mealType, !isOptedIn);
      onConfirmChange(dateString, mealType, !isOptedIn);
    } catch (error) {
      console.error('Failed to update confirmation', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getButtonState = () => {
    if (isPastDeadline()) {
        return {
            text: isOptedIn ? 'Confirmed (Locked)' : 'Selection Closed',
            action: () => {},
            disabled: true,
            className: 'bg-slate-300 text-slate-500 cursor-not-allowed',
        };
    }

    if (!isOptedIn) {
        return {
            text: 'Opt-In',
            action: handleToggleConfirmation,
            disabled: isUpdating,
            className: 'bg-primary text-onPrimary hover:bg-primary-dark',
        };
    } else {
        return {
            text: 'Opt-Out',
            action: handleToggleConfirmation,
            disabled: isUpdating,
            className: 'bg-orange-100 text-secondary hover:bg-orange-200',
        };
    }
  };

  const buttonState = getButtonState();

  const isToday = new Date().toISOString().split('T')[0] === date.toISOString().split('T')[0];
  const mealHasPassed = () => {
    const now = new Date();
    now.setHours(simulatedTime.hour, simulatedTime.minute, 0, 0);
    const mealEndTime = parseInt(time.split(' – ')[1].split(':')[0]);
    return isToday && now.getHours() >= mealEndTime;
  };

  return (
    <div className="bg-surface rounded-xl shadow-lg p-6 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="flex items-center mb-2">
        <Icon className="w-8 h-8 text-primary" />
        <h3 className="text-2xl font-bold ml-3 text-onSurface">{mealType}</h3>
      </div>
      <p className="text-sm text-slate-500 mb-4 ml-11 -mt-2">{time}</p>

      <ul className="space-y-3 mb-6 flex-grow min-h-[100px]">
        {items.map(item => (
          <li key={item.id}>
            <p className="font-semibold text-onSurface">{item.name}</p>
            <p className="text-sm text-slate-500">{item.description}</p>
          </li>
        ))}
         {items.length === 0 && (
            <p className="text-slate-400 text-sm p-2">Menu not yet available.</p>
        )}
      </ul>
      <button
        onClick={buttonState.action}
        disabled={buttonState.disabled}
        className={`w-full py-3 px-4 font-bold rounded-lg transition-colors duration-300 ${buttonState.className}`}
      >
        {isUpdating ? 'Updating...' : buttonState.text}
      </button>

      {isOptedIn && isPastDeadline() && mealHasPassed() && (
        <button
          onClick={() => setIsFeedbackModalOpen(true)}
          className="w-full mt-3 py-2 px-4 font-semibold text-sm rounded-lg transition-colors duration-300 bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          Leave Feedback
        </button>
      )}

      {isFeedbackModalOpen && (
        <FeedbackModal
          mealType={mealType}
          user={user}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MenuCard;
