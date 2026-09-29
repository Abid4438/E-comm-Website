import { IReviewService } from '../interfaces/IReviewService';
import { Review, CreateReviewInput } from '../../types/review';

const API_BASE = '/api/reviews';

export class ApiReviewService implements IReviewService {
  async getReviewsByProductId(productId: string): Promise<Review[]> {
    const res = await fetch(`${API_BASE}/product/${productId}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  }

  async getAllReviews(): Promise<Review[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  }

  async createReview(input: CreateReviewInput): Promise<Review> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to create review');
    return res.json();
  }

  async updateReviewStatus(id: string, status: 'approved' | 'pending' | 'rejected'): Promise<Review> {
    const res = await fetch(`${API_BASE}/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update review status');
    return res.json();
  }

  async voteHelpful(id: string): Promise<Review> {
    const res = await fetch(`${API_BASE}/${id}/helpful`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to vote helpful');
    return res.json();
  }
}
