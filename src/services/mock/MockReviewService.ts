import { IReviewService } from '../interfaces/IReviewService';
import { Review, CreateReviewInput } from '../../types/review';
import { INITIAL_REVIEWS } from '../../data/mockData';
import { MockProductService } from './MockProductService';

const REVIEWS_KEY = 'moss_reviews_db';

export class MockReviewService implements IReviewService {
  private getStoredReviews(): Review[] {
    try {
      const stored = localStorage.getItem(REVIEWS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    this.saveReviews(INITIAL_REVIEWS);
    return INITIAL_REVIEWS;
  }

  private saveReviews(reviews: Review[]): void {
    try {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    } catch {
      // fallback
    }
  }

  async getReviewsByProductId(productId: string): Promise<Review[]> {
    const reviews = this.getStoredReviews();
    return reviews.filter(r => r.productId === productId && r.status === 'approved');
  }

  async getAllReviews(): Promise<Review[]> {
    return this.getStoredReviews();
  }

async createReview(input: CreateReviewInput): Promise<Review> {
    const reviews = this.getStoredReviews();
    const svc = new MockProductService();
    const product = await svc.getProductById(input.productId);

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: input.productId,
      productName: product?.name || 'MOSS Essential Item',
      author: input.author,
      location: input.location || 'Verified Buyer',
      rating: input.rating,
      title: input.title,
      comment: input.comment,
      date: new Date().toISOString().split('T')[0],
      verified: true,
      status: 'approved',
      helpfulCount: 0,
    };

    const updated = [newReview, ...reviews];
    this.saveReviews(updated);
    return newReview;
  }

  async updateReviewStatus(id: string, status: 'approved' | 'pending' | 'rejected'): Promise<Review> {
    const reviews = this.getStoredReviews();
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Review not found');

    reviews[idx].status = status;
    this.saveReviews(reviews);
    return reviews[idx];
  }

  async voteHelpful(id: string): Promise<Review> {
    const reviews = this.getStoredReviews();
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Review not found');

    reviews[idx].helpfulCount = (reviews[idx].helpfulCount || 0) + 1;
    this.saveReviews(reviews);
    return reviews[idx];
  }
}
