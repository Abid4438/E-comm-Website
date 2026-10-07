import { IReviewService } from '../interfaces/IReviewService';
import { Review, CreateReviewInput } from '../../types/review';
import { MockReviewService } from '../mock/MockReviewService';

const API_BASE = '/api/reviews';
const mockReviewService = new MockReviewService();

export class ApiReviewService implements IReviewService {
  async getReviewsByProductId(productId: string): Promise<Review[]> {
    try {
      const res = await fetch(`${API_BASE}/product/${productId}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockReviewService.getReviewsByProductId(productId);
  }

  async getAllReviews(): Promise<Review[]> {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockReviewService.getAllReviews();
  }

  async createReview(input: CreateReviewInput): Promise<Review> {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockReviewService.createReview(input);
  }

  async updateReviewStatus(id: string, status: 'approved' | 'pending' | 'rejected'): Promise<Review> {
    try {
      const res = await fetch(`${API_BASE}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockReviewService.updateReviewStatus(id, status);
  }

  async voteHelpful(id: string): Promise<Review> {
    try {
      const res = await fetch(`${API_BASE}/${id}/helpful`, {
        method: 'POST',
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockReviewService.voteHelpful(id);
  }
}
