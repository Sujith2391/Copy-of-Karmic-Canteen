import React from 'react';
import { User, WorkLocation } from '../types';

interface DailyWorkPlannerProps {
  user: User;
  tomorrowsLocation: WorkLocation | null;
  onPlanChange: (location: WorkLocation) => void;
  disabled: boolean;
}

const DailyWorkPlanner: React.FC<DailyWorkPlannerProps> = ({ user, tomorrowsLocation, onPlanChange, disabled }) => {
  // The default value is the user's permanent setting if no specific plan is set for tomorrow.
  const selection = tomorrowsLocation ?? user.workLocation;

  const RadioOption: React.FC<{ value: WorkLocation; label: string; icon: string }> = ({ value, label, icon }) => (
    <label
      className={`flex-1 flex items-center justify-center p-3 text-sm font-medium rounded-lg border-2 cursor-pointer transition-all ${
        selection === value
          ? 'bg-primary-light border-primary-dark text-white shadow-md'
          : 'bg-slate-200 border-slate-200 hover:border-slate-400'
      }`}
    >
      <input
        type="radio"
        name="tomorrows-location"
        value={value}
        checked={selection === value}
        onChange={() => onPlanChange(value)}
        disabled={disabled}
        className="sr-only"
      />
      <span className="mr-2 text-lg">{icon}</span>
      {label}
    </label>
  );

  return (
    <div className={`transition-opacity ${disabled ? 'opacity-50' : 'opacity-100'}`}>
      <label className="block text-sm font-medium text-slate-700">
        Tomorrow's Work Plan
      </label>
      <p className="text-xs text-slate-500 mt-1 mb-2">This affects your notifications and reminders.</p>
      <div className="flex items-center space-x-2">
        <RadioOption value={WorkLocation.MAIN_OFFICE} label="Main Office" icon="🏢" />
        <RadioOption value={WorkLocation.WFH} label="WFH / Other" icon="🏠" />
      </div>
    </div>
  );
};

export default DailyWorkPlanner;
