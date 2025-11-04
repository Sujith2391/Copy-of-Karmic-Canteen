import React, { useState, useEffect } from 'react';
import { ConsolidatedReport, MealType, MealConfirmation, EmployeeConfirmationDetails } from '../../types';
import { onDashboardUpdate } from '../../services/api';
import { BreakfastIcon, LunchIcon, SnackIcon, DinnerIcon, PrintIcon } from '../icons';

const mealIcons: Record<MealType, React.FC<{className?: string}>> = {
  [MealType.BREAKFAST]: BreakfastIcon,
  [MealType.LUNCH]: LunchIcon,
  [MealType.SNACKS]: SnackIcon,
  [MealType.DINNER]: DinnerIcon,
};

const StatCard: React.FC<{ report: ConsolidatedReport }> = ({ report }) => {
    const Icon = mealIcons[report.mealType];

    return (
        <div className="bg-slate-50 rounded-lg p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
                <div className="flex items-center mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                    <h3 className="text-xl font-bold ml-3 text-onSurface">{report.mealType}</h3>
                </div>
                <div className="space-y-2">
                     <div className="flex justify-between items-baseline">
                        <span className="text-slate-500 font-bold">Total Confirmed</span>
                        <span className="text-3xl font-bold text-primary">{report.confirmed}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const renderStatus = (confirmation: MealConfirmation, mealType: MealType) => {
    const optedIn = confirmation[mealType];

    if (!optedIn) {
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Opted-Out</span>;
    }
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmed</span>;
};

const ConfirmationStats: React.FC = () => {
  const [report, setReport] = useState<ConsolidatedReport[]>([]);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeConfirmationDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onDashboardUpdate(({ report: reportData, details: detailsData }) => {
      setReport(reportData);
      setEmployeeDetails(detailsData);
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading && report.length === 0) {
    return <div className="text-center p-10">Loading live statistics...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 print-hidden">
        <h3 className="text-2xl font-bold text-onSurface">Today's Meal Report</h3>
        <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">Last updated: {lastUpdated}</span>
            <button
            onClick={() => window.print()}
            className="flex items-center px-3 py-2 text-sm font-semibold text-primary bg-green-100 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
            >
            <PrintIcon className="w-5 h-5 mr-1" />
            Print Report
            </button>
        </div>
      </div>
       <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold">Karmic Canteen - Daily Report</h1>
        <p>Date: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Dinner</th>
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
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-500">{renderStatus(employee.confirmation, MealType.DINNER)}</td>
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
