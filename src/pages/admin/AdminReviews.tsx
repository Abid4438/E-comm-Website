import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/apiClient';
import { Review } from '../../types/review';
import { Rating } from '../../components/ui/Rating';
import { useToastStore } from '../../store/useToastStore';
import { Check, X, Star } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToastStore();

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await reviewService.getAllReviews();
      setReviews(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await reviewService.updateReviewStatus(id, status);
      showToast({
        title: 'Review Updated',
        message: `Review marked as ${status}.`,
        type: 'info',
      });
      loadReviews();
    } catch {
      showToast({ title: 'Error', message: 'Could not update review.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
          Community Feedback Moderation
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
          Product Reviews ({reviews.length})
        </h1>
      </div>

      <div className="bg-[#FAF8F5] border border-sand-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-200/60 border-b border-sand-300 uppercase tracking-wider text-charcoal-800 font-semibold">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Author</th>
                <th className="p-3.5">Rating</th>
                <th className="p-3.5">Review Commentary</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-charcoal-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-charcoal-500">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-charcoal-500">
                    No reviews in moderation queue.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-sand-100/50 transition-colors">
                    <td className="p-3.5 font-serif font-semibold text-charcoal-900 max-w-xs truncate">
                      {r.productName}
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-charcoal-900 block">{r.author}</span>
                      <span className="text-[10px] text-charcoal-400">{r.location}</span>
                    </td>
                    <td className="p-3.5">
                      <Rating value={r.rating} size="sm" />
                    </td>
                    <td className="p-3.5 max-w-md">
                      <span className="font-medium text-charcoal-900 block font-serif text-sm">
                        "{r.title}"
                      </span>
                      <p className="text-[11px] text-charcoal-600 line-clamp-2 mt-0.5">{r.comment}</p>
                    </td>
                    <td className="p-3.5">{r.date}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider border ${
                          r.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : r.status === 'rejected'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      {r.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'approved')}
                          className="p-1 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Approve Review"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {r.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'rejected')}
                          className="p-1 text-red-700 hover:bg-red-100 transition-colors"
                          title="Reject / Hide Review"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
