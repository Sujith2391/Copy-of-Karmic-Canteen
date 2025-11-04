import React, { useState, useEffect } from 'react';
import { Feedback } from '../../types';
import { onFeedbackUpdate } from '../../services/api';
import { StarIcon } from '../icons';

const FeedbackViewer: React.FC = () => {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onFeedbackUpdate((feedbackData) => {
            setFeedback(feedbackData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const renderStars = (rating: number) => {
        return (
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} filled={i < rating} className="w-5 h-5 text-yellow-400" />
                ))}
            </div>
        );
    };

    if (loading) {
        return <div className="text-center p-10">Loading feedback...</div>;
    }

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-onSurface">Employee Feedback</h3>
            {feedback.length === 0 ? (
                <p className="text-slate-500">No feedback has been submitted yet.</p>
            ) : (
                <div className="space-y-4">
                    {feedback.map((item) => (
                        <div key={item.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-onSurface">{item.userName}</p>
                                    <p className="text-sm text-slate-500">
                                        {item.mealType} on {new Date(item.date + 'T00:00:00').toLocaleDateString()}
                                    </p>
                                </div>
                                {renderStars(item.rating)}
                            </div>
                            {item.comment && (
                                <p className="mt-2 pt-2 border-t border-slate-200 text-slate-700 italic">
                                    "{item.comment}"
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedbackViewer;
