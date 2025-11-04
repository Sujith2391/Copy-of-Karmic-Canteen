import React, { useState, useEffect, useCallback } from 'react';
import { DailyMenu, MealType, MenuItem } from '../../types';
import { getMenuForDay, addMenuItem, deleteMenuItem, updateMenuItem } from '../../services/api';

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MenuManager: React.FC = () => {
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const fetchMenu = useCallback(async (day: number) => {
    setLoading(true);
    try {
        const date = new Date();
        date.setDate(date.getDate() - date.getDay() + day);
        const menuData = await getMenuForDay(date);
        setMenu(menuData);
    } catch (error) {
        console.error("Failed to fetch menu for day " + day, error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu(selectedDay);
  }, [selectedDay, fetchMenu]);

  const handleAdd = async (mealType: MealType) => {
    const name = prompt(`Enter new item name for ${mealType}:`);
    if (!name) return;
    const description = prompt(`Enter description for ${name}:`);
    if (name && description) {
      setLoading(true);
      await addMenuItem(selectedDay, mealType, { name, description });
      await fetchMenu(selectedDay);
    }
  };

  const handleDelete = async (mealType: MealType, itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setLoading(true);
      await deleteMenuItem(selectedDay, mealType, itemId);
      await fetchMenu(selectedDay);
    }
  };

  const handleEdit = async (mealType: MealType, item: MenuItem) => {
    const newName = prompt(`Enter new name for ${item.name}:`, item.name);
    if (!newName) return;
    const newDescription = prompt(`Enter new description:`, item.description);
    if (newName && newDescription !== null) {
      setLoading(true);
      const updatedItem = { ...item, name: newName, description: newDescription };
      await updateMenuItem(selectedDay, mealType, updatedItem);
      await fetchMenu(selectedDay);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-onSurface">Menu Management</h3>
      
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        {weekDays.map((day, index) => (
          <button
            key={day}
            onClick={() => setSelectedDay(index)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              selectedDay === index
                ? 'bg-primary text-onPrimary shadow'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="text-center p-10">Loading menu for {weekDays[selectedDay]}...</div>
      ) : menu && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {Object.values(MealType).map(mealType => (
            <div key={mealType} className="bg-slate-50 p-4 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold mb-3 text-primary">{mealType}</h4>
              <ul className="space-y-2 mb-4 min-h-[100px]">
                {menu[mealType].map(item => (
                  <li key={item.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleEdit(mealType, item)}
                        className="text-blue-500 hover:text-blue-700 font-medium px-2 py-1 text-sm"
                        aria-label={`Edit ${item.name}`}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(mealType, item.id)}
                        className="text-red-500 hover:text-red-700 font-bold px-2 py-1"
                        aria-label={`Delete ${item.name}`}
                      >
                        &times;
                      </button>
                    </div>
                  </li>
                ))}
                {menu[mealType].length === 0 && (
                    <p className="text-slate-400 text-sm p-2">No items for this meal.</p>
                )}
              </ul>
              <button
                onClick={() => handleAdd(mealType)}
                className="w-full py-2 text-sm font-semibold bg-primary text-onPrimary rounded hover:bg-primary-dark"
              >
                + Add Item
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuManager;
