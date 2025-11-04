import React from 'react';
import { MealType } from '../types';
import { BellIcon, CloseIcon } from './icons';

interface ReconfirmationAlertProps {
  isOpen: boolean;
  mealType: MealType | null;
  onClose: () => void;
  onReconfirm: () => void;
  onOptOut: () => void;
}

const ReconfirmationAlert: React.FC<ReconfirmationAlertProps> = ({ isOpen, mealType, onClose, onReconfirm, onOptOut }) => {
  if (!isOpen || !mealType) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      aria-labelledby="reconfirmation-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all" role="document">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                    <BellIcon className="h-6 w-6 text-secondary" />
                </div>
                <div className="ml-4">
                    <h3 className="text-xl font-bold text-onSurface" id="reconfirmation-title">Reconfirmation Required</h3>
                    <p className="text-sm text-slate-500 mt-1">The window for {mealType} is open!</p>
                </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              aria-label="Close"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
        </div>

        <p className="text-onSurface mb-6">
          Please reconfirm if you'll be having <span className="font-bold">{mealType}</span>. This helps us prepare the right amount of food and prevent waste.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={onReconfirm}
            className="w-full flex items-center justify-center px-4 py-3 font-semibold text-onPrimary bg-primary rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-transform transform hover:scale-105"
          >
            Yes, Reconfirm Meal
          </button>
          <button
            onClick={onOptOut}
            className="w-full flex items-center justify-center px-4 py-3 font-semibold text-secondary bg-orange-100 rounded-lg shadow-md hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-transform transform hover:scale-105"
          >
            I'm not having it
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReconfirmationAlert;