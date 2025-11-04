import React, { useState } from 'react';
import { MealType, User } from '../types';
import { addFeedback } from '../services/api';
import { CloseIcon, StarIcon } from './icons';

interface FeedbackModalProps {
  mealType: MealType;
  user: User;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ mealType, user, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please provide a star rating.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await addFeedback({
        userId: user.id,
        userName: user.name,
        mealType,
        rating,
        comment,
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit feedback', err);
      setError('Could not submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-form-title"
    >
      <div className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all" role="document">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-onSurface" id="feedback-form-title">
            Feedback for {mealType}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            aria-label="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Your Rating</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="text-yellow-400 focus:outline-none"
                  aria-label={`Rate ${star} star`}
                >
                  <StarIcon filled={(hoverRating || rating) >= star} className="w-8 h-8" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-slate-700">Comments (Optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of the meal?"
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="pt-2 flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
