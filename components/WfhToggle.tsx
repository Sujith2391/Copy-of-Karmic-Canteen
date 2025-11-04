import React from 'react';

interface WfhToggleProps {
  isWfh: boolean;
  isLoading: boolean;
  onToggle: (isWfh: boolean) => void;
}

const WfhToggle: React.FC<WfhToggleProps> = ({ isWfh, isLoading, onToggle }) => {
  const handleToggle = () => {
    if (isLoading) return;
    onToggle(!isWfh);
  };

  return (
    <div className="bg-surface p-4 rounded-xl shadow-lg flex items-center justify-between">
      <div>
        <h4 className="font-bold text-onSurface">Plan for Tomorrow</h4>
        <p className="text-sm text-slate-500">
          {isWfh 
            ? "You've indicated you'll be working from home. Meals for tomorrow will be opted-out." 
            : "You're planning to be in the office. Meal confirmations are active."}
        </p>
      </div>
      <div className="flex items-center space-x-3">
        {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>}
        <span className="text-sm font-medium text-slate-700">Work From Home</span>
        <button
          type="button"
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isWfh ? 'bg-primary' : 'bg-slate-300'}`}
          role="switch"
          aria-checked={isWfh}
          aria-label="Toggle Work From Home for tomorrow"
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isWfh ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>
    </div>
  );
};

export default WfhToggle;
