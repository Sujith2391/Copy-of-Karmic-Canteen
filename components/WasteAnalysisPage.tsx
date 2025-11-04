import React from 'react';
import WasteChart from './admin/WasteChart';
import Logo from './Logo';

interface WasteAnalysisPageProps {
  onBack: () => void;
}

const WasteAnalysisPage: React.FC<WasteAnalysisPageProps> = ({ onBack }) => {
  return (
    <div className="container mx-auto space-y-6">
       <div className="flex justify-between items-center">
            <div className="flex-1">
                <h2 className="text-3xl font-bold text-onSurface">Consumption Analysis Report</h2>
                <p className="text-slate-500">Secure view of historical consumption data.</p>
            </div>
            <div className="hidden sm:block">
                 <Logo className="h-12 w-auto"/>
            </div>
       </div>

      <div className="bg-surface p-6 rounded-xl shadow-lg">
        <WasteChart />
      </div>
    </div>
  );
};

export default WasteAnalysisPage;
