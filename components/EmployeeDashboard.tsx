import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, DailyMenu, MealConfirmation, MealType } from '../types';
import { getMenuForToday, getUserConfirmation, reconfirmMeal, updateConfirmation, getTomorrowsConfirmation, setWfhForTomorrow } from '../services/api';
import MenuCard from './MenuCard';
import CountdownTimer from './CountdownTimer';
import ReconfirmationAlert from './ReconfirmationAlert';
import WfhToggle from './WfhToggle';
import { BellIcon, CloseIcon } from './icons';

interface EmployeeDashboardProps {
  user: User;
}

const mealConfig: Record<MealType, { reconfirmStart: number; reconfirmEnd: number; reconfirmedKey: keyof MealConfirmation; confirmedKey: keyof MealConfirmation }> = {
    [MealType.BREAKFAST]: { reconfirmStart: 7, reconfirmEnd: 8, reconfirmedKey: 'breakfastReconfirmed', confirmedKey: MealType.BREAKFAST },
    [MealType.LUNCH]: { reconfirmStart: 10, reconfirmEnd: 11, reconfirmedKey: 'lunchReconfirmed', confirmedKey: MealType.LUNCH },
    [MealType.SNACKS]: { reconfirmStart: 14, reconfirmEnd: 15, reconfirmedKey: 'snacksReconfirmed', confirmedKey: MealType.SNACKS },
};

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user }) => {
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [confirmation, setConfirmation] = useState<MealConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatedTime, setSimulatedTime] = useState(new Date().getHours());
  const [alertMeal, setAlertMeal] = useState<MealType | null>(null);
  const shownAlertsRef = useRef<Set<MealType>>(new Set());

  const [isWfhTomorrow, setIsWfhTomorrow] = useState(false);
  const [isWfhLoading, setIsWfhLoading] = useState(true);
  
  const [showEveningReminder, setShowEveningReminder] = useState(false);
  const shownEveningRemindersRef = useRef<Set<number>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setIsWfhLoading(true);
    try {
      const [menuData, confirmationData, tomorrowsConfirmationData] = await Promise.all([
        getMenuForToday(),
        getUserConfirmation(user.id),
        getTomorrowsConfirmation(user.id),
      ]);
      setMenu(menuData);
      setConfirmation(confirmationData);
      setIsWfhTomorrow(tomorrowsConfirmationData.wfh ?? false);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
      setIsWfhLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (simulatedTime === 0) {
        shownAlertsRef.current.clear();
        shownEveningRemindersRef.current.clear();
    }
    if (confirmation) {
        for (const mealType of Object.values(MealType)) {
            const config = mealConfig[mealType];
            const isOptedIn = confirmation[config.confirmedKey];
            const isReconfirmed = confirmation[config.reconfirmedKey];
            const inWindow = simulatedTime >= config.reconfirmStart && simulatedTime < config.reconfirmEnd;

            if (inWindow && isOptedIn && !isReconfirmed && !shownAlertsRef.current.has(mealType)) {
                setAlertMeal(mealType);
                shownAlertsRef.current.add(mealType);
                return;
            }
        }
    }
    
    const hour = simulatedTime;
    if (hour >= 18 && hour < 21) {
        if (!shownEveningRemindersRef.current.has(hour)) {
            setShowEveningReminder(true);
            shownEveningRemindersRef.current.add(hour);
        }
    }
  }, [simulatedTime, confirmation]);

  const handleConfirmChange = useCallback(() => {
    getUserConfirmation(user.id).then(setConfirmation);
  }, [user.id]);

  const handleWfhToggle = async (newWfhStatus: boolean) => {
    setIsWfhLoading(true);
    try {
        await setWfhForTomorrow(user.id, newWfhStatus);
        setIsWfhTomorrow(newWfhStatus);
    } catch (error) {
        console.error("Failed to update WFH status", error);
    } finally {
        setIsWfhLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlertMeal(null);
  };
  
  const handleEveningReminderClose = () => {
    setShowEveningReminder(false);
  };

  const handleAlertReconfirm = async () => {
    if (alertMeal) {
      await reconfirmMeal(user.id, alertMeal);
      handleConfirmChange();
      handleAlertClose();
    }
  };

  const handleAlertOptOut = async () => {
    if (alertMeal) {
      await updateConfirmation(user.id, alertMeal, false);
      handleConfirmChange();
      handleAlertClose();
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading your dashboard...</div>;
  }

  if (!menu || !confirmation) {
    return <div className="text-center p-10 text-red-500">Could not load your dashboard. Please try again later.</div>;
  }

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-onSurface">Today's Menu</h2>
        <p className="text-slate-500">Confirm your meals for {new Date(menu.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</p>
      </div>
      
      <div className="bg-surface p-4 rounded-xl shadow-lg">
        <label htmlFor="time-slider" className="block text-sm font-medium text-slate-700 mb-2">
          🕒 Time Simulator (Hour of Day)
        </label>
        <div className="flex items-center space-x-4">
          <input
            id="time-slider"
            type="range"
            min="0"
            max="23"
            value={simulatedTime}
            onChange={(e) => setSimulatedTime(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="font-bold text-lg text-primary w-24 text-center">{`${simulatedTime.toString().padStart(2, '0')}:00`}</span>
        </div>
      </div>

      <WfhToggle isWfh={isWfhTomorrow} isLoading={isWfhLoading} onToggle={handleWfhToggle} />
      <CountdownTimer simulatedHour={simulatedTime} />
      <ReconfirmationAlert 
        isOpen={!!alertMeal}
        mealType={alertMeal}
        onClose={handleAlertClose}
        onReconfirm={handleAlertReconfirm}
        onOptOut={handleAlertOptOut}
      />
      
      {showEveningReminder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          aria-labelledby="evening-reminder-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all" role="document">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                        <BellIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-xl font-bold text-onSurface" id="evening-reminder-title">Evening Reminder</h3>
                        <p className="text-sm text-slate-500 mt-1">Time to confirm tomorrow's meals!</p>
                    </div>
                </div>
                <button
                  onClick={handleEveningReminderClose}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  aria-label="Close"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="mb-6">
              <CountdownTimer simulatedHour={simulatedTime} />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleEveningReminderClose}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-3 font-semibold text-onPrimary bg-primary rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-transform transform hover:scale-105"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <MenuCard
          mealType={MealType.BREAKFAST}
          items={menu[MealType.BREAKFAST]}
          confirmation={confirmation}
          onConfirmChange={handleConfirmChange}
          user={user}
          simulatedTime={simulatedTime}
        />
        <MenuCard
          mealType={MealType.LUNCH}
          items={menu[MealType.LUNCH]}
          confirmation={confirmation}
          onConfirmChange={handleConfirmChange}
          user={user}
          simulatedTime={simulatedTime}
        />
        <MenuCard
          mealType={MealType.SNACKS}
          items={menu[MealType.SNACKS]}
          confirmation={confirmation}
          onConfirmChange={handleConfirmChange}
          user={user}
          simulatedTime={simulatedTime}
        />
      </div>
    </div>
  );
};

export default EmployeeDashboard;