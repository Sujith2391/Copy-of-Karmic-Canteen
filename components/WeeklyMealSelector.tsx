import React, { useState, useEffect, useCallback } from 'react';
import { User, DailyMenu, MealConfirmation, MealType } from '../types';
import { getMenuForDay, getConfirmationsForWeek, updateConfirmation } from '../services/api';
import MenuCard from './MenuCard';

interface WeeklyMealSelectorProps {
  user: User;
  simulatedTime: { hour: number; minute: number };
}

const getStartOfWeek = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday is the first day
  return new Date(start.setDate(diff));
};

const WeeklyMealSelector: React.FC<WeeklyMealSelectorProps> = ({ user, simulatedTime }) => {
  const [weekStartDate, setWeekStartDate] = useState(getStartOfWeek(new Date()));
  const [menus, setMenus] = useState<Record<string, DailyMenu>>({});
  const [confirmations, setConfirmations] = useState<Record<string, MealConfirmation>>({});
  const [loading, setLoading] = useState(true);

  const fetchWeekData = useCallback(async (startDate: Date) => {
    setLoading(true);
    try {
      const menuPromises: Promise<DailyMenu>[] = [];
      const dates: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        dates.push(date);
        menuPromises.push(getMenuForDay(date));
      }
      const menuResults = await Promise.all(menuPromises);
      const newMenus = menuResults.reduce((acc, menu) => {
        acc[menu.date] = menu;
        return acc;
      }, {} as Record<string, DailyMenu>);
      
      const confirmationResults = await getConfirmationsForWeek(user.id, startDate);

      setMenus(newMenus);
      setConfirmations(confirmationResults);
    } catch (error) {
      console.error('Failed to fetch weekly data', error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchWeekData(weekStartDate);
  }, [weekStartDate, fetchWeekData]);
  
  const handleConfirmChange = (date: string, mealType: MealType, status: boolean) => {
    setConfirmations(prev => {
        const newConfirmations = { ...prev };
        if (newConfirmations[date]) {
            newConfirmations[date] = { ...newConfirmations[date], [mealType]: status };
        }
        return newConfirmations;
    });
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    setWeekStartDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
      return newDate;
    });
  };

  const renderDay = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const menu = menus[dateString];
    const confirmation = confirmations[dateString];
    const isToday = new Date().toISOString().split('T')[0] === dateString;
    
    return (
        <div key={dateString} className={`p-4 rounded-lg ${isToday ? 'bg-green-50 border-2 border-primary' : 'bg-slate-50'}`}>
            <h3 className="text-lg font-bold text-center mb-4">
                {date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            {menu && confirmation ? (
                 <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
                    {Object.values(MealType).map(mealType => (
                         <MenuCard
                            key={mealType}
                            mealType={mealType}
                            items={menu[mealType]}
                            confirmation={confirmation}
                            onConfirmChange={handleConfirmChange}
                            user={user}
                            date={date}
                            simulatedTime={simulatedTime}
                        />
                    ))}
                 </div>
            ) : <div className="text-center text-slate-500">Loading meals...</div>}
        </div>
    );
  };

  const datesOfWeek = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <div className="bg-surface p-6 rounded-xl shadow-lg space-y-4">
        <div className="flex justify-between items-center">
            <button onClick={() => changeWeek('prev')} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">&larr; Previous Week</button>
            <h2 className="text-xl font-bold">
                Week of {weekStartDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
            </h2>
            <button onClick={() => changeWeek('next')} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">Next Week &rarr;</button>
        </div>
        {loading ? (
             <div className="text-center p-20">Loading weekly menu...</div>
        ) : (
            <div className="space-y-6">
                {datesOfWeek.map(date => renderDay(date))}
            </div>
        )}
    </div>
  );
};

export default WeeklyMealSelector;
