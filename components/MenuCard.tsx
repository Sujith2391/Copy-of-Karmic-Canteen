import React, { useState } from 'react';
import { MealType, MenuItem, MealConfirmation, User } from '../types';
import { BreakfastIcon, LunchIcon, SnackIcon } from './icons';
import { updateConfirmation, reconfirmMeal } from '../services/api';

interface MenuCardProps {
  mealType: MealType;
  items: MenuItem[];
  confirmation: MealConfirmation;
  onConfirmChange: () => void;
  user: User;
  simulatedTime: number;
}

const mealIcons: Record<MealType, React.FC<{className?: string}>> = {
  [MealType.BREAKFAST]: BreakfastIcon,
  [MealType.LUNCH]: LunchIcon,
  [MealType.SNACKS]: SnackIcon,
};

const mealConfig = {
    [MealType.BREAKFAST]: { reconfirmStart: 7, reconfirmEnd: 8, reconfirmedKey: 'breakfastReconfirmed' as keyof MealConfirmation },
    [MealType.LUNCH]: { reconfirmStart: 10, reconfirmEnd: 11, reconfirmedKey: 'lunchReconfirmed' as keyof MealConfirmation },
    [MealType.SNACKS]: { reconfirmStart: 14, reconfirmEnd: 15, reconfirmedKey: 'snacksReconfirmed' as keyof MealConfirmation },
}

const MenuCard: React.FC<MenuCardProps> = ({ mealType, items, confirmation, onConfirmChange, user, simulatedTime }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const Icon = mealIcons[mealType];
  const isOptedIn = confirmation[mealType];
  
  const config = mealConfig[mealType];
  const isReconfirmed = confirmation[config.reconfirmedKey] as boolean;
  const isReconfirmWindow = simulatedTime >= config.reconfirmStart && simulatedTime < config.reconfirmEnd;
  const isAfterOptInCutoff = simulatedTime >= 21; // 9 PM

  const handleToggleConfirmation = async () => {
    if (isAfterOptInCutoff) return; // Safeguard
    setIsUpdating(true);
    try {
      await updateConfirmation(user.id, mealType, !isOptedIn);
      onConfirmChange();
    } catch (error) {
      console.error('Failed to update confirmation', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReconfirm = async () => {
    setIsUpdating(true);
    try {
        await reconfirmMeal(user.id, mealType);
        onConfirmChange();
    } catch (error) {
        console.error('Failed to reconfirm meal', error);
    } finally {
        setIsUpdating(false);
    }
  };

  const getButtonState = () => {
    // 1. Final state: Already reconfirmed.
    if (isReconfirmed) {
        return {
            text: '✔️ Reconfirmed',
            action: () => {},
            disabled: true,
            className: 'bg-green-200 text-green-800 cursor-not-allowed',
        };
    }

    // 2. High-priority action: Reconfirmation window is open for opted-in users.
    if (isReconfirmWindow && isOptedIn) {
        return {
            text: 'Reconfirm Now',
            action: handleReconfirm,
            disabled: isUpdating,
            className: 'bg-secondary text-onPrimary hover:bg-orange-600 animate-pulse',
        };
    }

    // 3. General deadline: Past the 9 PM cutoff for initial confirmations.
    if (isAfterOptInCutoff) {
        return {
            text: isOptedIn ? 'Confirmed (Locked)' : 'Confirmation Closed',
            action: () => {},
            disabled: true,
            className: 'bg-slate-300 text-slate-500 cursor-not-allowed',
        };
    }

    // 4. Default state: Before cutoff, user can opt-in or opt-out.
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

  return (
    <div className="bg-surface rounded-xl shadow-lg p-6 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="flex items-center mb-4">
        <Icon className="w-8 h-8 text-primary" />
        <h3 className="text-2xl font-bold ml-3 text-onSurface">{mealType}</h3>
      </div>
      <ul className="space-y-3 mb-6 flex-grow">
        {items.map(item => (
          <li key={item.id}>
            <p className="font-semibold text-onSurface">{item.name}</p>
            <p className="text-sm text-slate-500">{item.description}</p>
          </li>
        ))}
         {items.length === 0 && (
            <p className="text-slate-400 text-sm p-2">No items for this meal today.</p>
        )}
      </ul>
      <button
        onClick={buttonState.action}
        disabled={buttonState.disabled}
        className={`w-full py-3 px-4 font-bold rounded-lg transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${buttonState.className}`}
      >
        {isUpdating ? 'Updating...' : buttonState.text}
      </button>
    </div>
  );
};

export default MenuCard;
