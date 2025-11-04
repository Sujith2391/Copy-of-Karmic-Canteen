import React, { useState, useEffect } from 'react';
import { ConsolidatedReport } from '../../types';
import { getWasteAnalytics } from '../../services/api';

// Since Recharts is loaded from a CDN, it's available on the window object.
// We need to destructure it for use.
declare global {
    interface Window {
        Recharts: any;
    }
}

const WasteChart: React.FC = () => {
    const [data, setData] = useState<ConsolidatedReport[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Check if Recharts is available on the window object
    if (typeof window.Recharts === 'undefined') {
      return <div className="text-center p-10 text-red-500">Charting library not loaded. Please check your internet connection and refresh.</div>;
    }

    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = window.Recharts;
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const analyticsData = await getWasteAnalytics();
            setData(analyticsData);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center p-10">Loading analytics data...</div>;
    }
    
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-onSurface">Consumption Analytics (Lunch)</h3>
            <p className="text-slate-500 mb-6">Visualizing confirmed meals to track consumption planning effectiveness.</p>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            }}
                        />
                        <Legend />
                        <Bar dataKey="confirmed" fill="#16a34a" name="Total Confirmed" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WasteChart;
