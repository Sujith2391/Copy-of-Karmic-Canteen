import React, { useState, useEffect, useCallback } from 'react';
import { User, WorkLocation } from '../types';
import { updateUser, getWorkPlanForDate, updateWorkPlan } from '../services/api';
import WeeklyMealSelector from './WeeklyMealSelector';
import MealSelectionReminder from './MealSelectionReminder';
import DailyWorkPlanner from './DailyWorkPlanner';

interface EmployeeDashboardProps {
  user: User;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user }) => {
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [tomorrowsLocation, setTomorrowsLocation] = useState<WorkLocation | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(true);

  // Time simulator for testing the 12:30 PM reminder
  const [simulatedTime, setSimulatedTime] = useState({ hour: new Date().getHours(), minute: new Date().getMinutes() });

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchPlan = async () => {
        setIsPlanLoading(true);
        const tomorrow = getTomorrowDateString();
        try {
            const plan = await getWorkPlanForDate(user.id, tomorrow);
            setTomorrowsLocation(plan ? plan.location : null);
        } catch (error) {
            console.error("Failed to fetch tomorrow's work plan", error);
        } finally {
            setIsPlanLoading(false);
        }
    };
    fetchPlan();
  }, [user.id]);

  const handlePlanChange = async (location: WorkLocation) => {
      setIsPlanLoading(true);
      const tomorrow = getTomorrowDateString();
      try {
        await updateWorkPlan(user.id, tomorrow, location);
        setTomorrowsLocation(location);
      } catch (error) {
        console.error("Failed to update tomorrow's work plan", error);
      } finally {
        setIsPlanLoading(false);
      }
  };

  const handleLocationChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocation = e.target.value as WorkLocation;
    setIsUpdatingLocation(true);
    try {
      await updateUser(currentUser.id, { workLocation: newLocation });
      const updatedUser = { ...currentUser, workLocation: newLocation };
      setCurrentUser(updatedUser);
      localStorage.setItem('karmic-canteen-user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to update work location", error);
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
       <div>
        <h2 className="text-3xl font-bold text-onSurface">Weekly Meal Planner</h2>
        <p className="text-slate-500">Select your meals for the upcoming week. Changes for a day must be made by 12:30 PM of the previous day.</p>
      </div>

      <div className="bg-surface p-4 rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
        <div>
            <label htmlFor="work-location" className="block text-sm font-medium text-slate-700">
              Your Default Location
            </label>
            <select
              id="work-location"
              value={currentUser.workLocation}
              onChange={handleLocationChange}
              disabled={isUpdatingLocation}
              className="mt-1 block w-full max-w-xs pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              {Object.values(WorkLocation).map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-1">This is your permanent setting.</p>
        </div>

        <DailyWorkPlanner 
            user={user} 
            tomorrowsLocation={tomorrowsLocation} 
            onPlanChange={handlePlanChange} 
            disabled={isPlanLoading} 
        />

        <div className="bg-slate-50 p-3 rounded-lg">
            <label htmlFor="time-slider" className="block text-sm font-medium text-slate-700 mb-2">
              🕒 Time Simulator
            </label>
            <div className="flex items-center space-x-4">
              <input
                id="time-slider"
                type="range"
                min="0"
                max="1439" // 23 * 60 + 59
                value={simulatedTime.hour * 60 + simulatedTime.minute}
                onChange={(e) => {
                    const totalMinutes = parseInt(e.target.value, 10);
                    setSimulatedTime({ hour: Math.floor(totalMinutes / 60), minute: totalMinutes % 60 });
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-bold text-lg text-primary w-28 text-center">
                {`${String(simulatedTime.hour).padStart(2, '0')}:${String(simulatedTime.minute).padStart(2, '0')}`}
              </span>
            </div>
        </div>
      </div>
      
      <MealSelectionReminder user={currentUser} simulatedTime={simulatedTime} tomorrowsLocation={tomorrowsLocation} />

      <WeeklyMealSelector user={currentUser} simulatedTime={simulatedTime} />
    </div>
  );
};

export default EmployeeDashboard;
