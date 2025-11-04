import React, { useState, useEffect } from 'react';
import { ConsolidatedReport, MealType, MealConfirmation, EmployeeConfirmationDetails } from '../../types';
import { onDashboardUpdate } from '../../services/api';
import { BreakfastIcon, LunchIcon, SnackIcon } from '../icons';

const mealIcons: Record<MealType, React.FC<{className?: string}>> = {
  [MealType.BREAKFAST]: BreakfastIcon,
  [MealType.LUNCH]: LunchIcon,
  [MealType.SNACKS]: SnackIcon,
};

const StatCard: React.FC<{ report: ConsolidatedReport }> = ({ report }) => {
    const Icon = mealIcons[report.mealType];
    const savedByReconfirm = report.confirmed - report.reconfirmed;
    const finalWaste = report.reconfirmed - report.pickedUp;

    return (
        <div className="bg-slate-50 rounded-lg p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
                <div className="flex items-center mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                    <h3 className="text-xl font-bold ml-3 text-onSurface">{report.mealType}</h3>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                        <span className="text-slate-500">Initially Confirmed</span>
                        <span className="text-2xl font-semibold text-slate-600">{report.confirmed}</span>
                    </div>
                     <div className="flex justify-between items-baseline">
                        <span className="text-slate-500 font-bold">Reconfirmed (Final)</span>
                        <span className="text-3xl font-bold text-primary">{report.reconfirmed}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-slate-500">Picked Up</span>
                        <span className="text-2xl font-semibold text-slate-700">{report.pickedUp}</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t">
                 <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-600">Saved by Reconfirmation</span>
                    <span className="font-bold text-primary bg-green-100 px-2 py-1 rounded">{savedByReconfirm} meals</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Final Uncollected</span>
                    <span className={`font-bold px-2 py-1 rounded ${finalWaste > 5 ? 'text-red-600 bg-red-100' : 'text-orange-600 bg-orange-100'}`}>{finalWaste} meals</span>
                </div>
            </div>
        </div>
    );
}

const renderStatus = (confirmation: MealConfirmation, mealType: MealType) => {
    const optedIn = confirmation[mealType];
    let reconfirmed = false;
    if (mealType === MealType.BREAKFAST) reconfirmed = !!confirmation.breakfastReconfirmed;
    if (mealType === MealType.LUNCH) reconfirmed = !!confirmation.lunchReconfirmed;
    if (mealType === MealType.SNACKS) reconfirmed = !!confirmation.snacksReconfirmed;

    if (!optedIn) {
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Opted-Out</span>;
    }
    if (reconfirmed) {
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary text-onPrimary">Reconfirmed</span>;
    }
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Confirmed</span>;
};

const ConfirmationStats: React.FC = () => {
  const [report, setReport] = useState<ConsolidatedReport[]>([]);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeConfirmationDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLoading(true);
    // Set up the real-time listener
    const unsubscribe = onDashboardUpdate(({ report: reportData, details: detailsData }) => {
      setReport(reportData);
      setEmployeeDetails(detailsData);
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  if (loading && report.length === 0) {
    return <div className="text-center p-10">Loading live statistics...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-onSurface">Today's Meal Report</h3>
        <span className="text-sm text-slate-500">Last updated: {lastUpdated}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {report.map(r => <StatCard key={r.mealType} report={r} />)}
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-bold text-onSurface mb-4">Employee Confirmation Details</h3>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Breakfast</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Lunch</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Snacks</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {employeeDetails.map(employee => (
                        <tr key={employee.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-900">{employee.name}</div>
                                <div className="text-sm text-slate-500">{employee.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-500">{renderStatus(employee.confirmation, MealType.BREAKFAST)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-500">{renderStatus(employee.confirmation, MealType.LUNCH)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-500">{renderStatus(employee.confirmation, MealType.SNACKS)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationStats;
