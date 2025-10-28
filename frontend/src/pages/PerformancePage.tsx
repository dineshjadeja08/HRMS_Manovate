import React, { useState, useEffect } from 'react';
import { performanceService } from '../services/performanceService';
import type { PerformanceReview } from '../services/performanceService';
import { useAuth } from '../contexts/AuthContext';
import PrimaryButton from '../components/UI/PrimaryButton';
import StatusBadge from '../components/UI/StatusBadge';
import { showSuccess, showError } from '../utils/toast';
import { StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const PerformancePage: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [feedbackData, setFeedbackData] = useState({
    overall_rating: 0,
    comments: '',
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      if (user?.employee_id) {
        const data = await performanceService.getManagerReviews(user.employee_id);
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to load performance reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const openFeedbackModal = (review: PerformanceReview) => {
    setSelectedReview(review);
    setFeedbackData({
      overall_rating: review.overall_rating || 0,
      comments: review.comments || '',
    });
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedReview(null);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    try {
      setSubmitting(true);
      await performanceService.submitFeedback(selectedReview.id, feedbackData);
      await loadReviews();
      closeFeedbackModal();
      showSuccess('Feedback submitted successfully');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      showError('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={() => onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-600">Loading performance reviews...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-800">Performance Reviews</h1>
        <p className="text-slate-500 mt-1">Review and provide feedback for your team</p>
      </div>

      {/* Pending Reviews */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-slate-800">Pending Reviews</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Review Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No pending performance reviews
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">
                        {review.employee?.first_name} {review.employee?.last_name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {review.employee?.employee_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {new Date(review.review_period_start).toLocaleDateString()} - <br />
                      {new Date(review.review_period_end).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {review.overall_rating ? (
                        renderStars(review.overall_rating)
                      ) : (
                        <span className="text-slate-400 text-sm">Not rated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={review.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openFeedbackModal(review)}
                        className="inline-flex items-center px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Provide Feedback
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              Performance Review Feedback
            </h3>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-slate-600">Employee:</div>
              <div className="text-lg font-semibold text-slate-800">
                {selectedReview.employee?.first_name} {selectedReview.employee?.last_name}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Review Period: {new Date(selectedReview.review_period_start).toLocaleDateString()} - {new Date(selectedReview.review_period_end).toLocaleDateString()}
              </div>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Overall Rating *
                </label>
                {renderStars(feedbackData.overall_rating, (rating) =>
                  setFeedbackData({ ...feedbackData, overall_rating: rating })
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={feedbackData.comments}
                  onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={6}
                  placeholder="Provide detailed feedback about the employee's performance..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeFeedbackModal}
                  disabled={submitting}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <PrimaryButton type="submit" disabled={submitting || feedbackData.overall_rating === 0}>
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePage;
