import { Review, CreateReviewInput } from '../../types/review';

export interface IReviewService {
  getReviewsByProductId(productId: string): Promise<Review[]>;
  getAllReviews(): Promise<Review[]>;
  createReview(input: CreateReviewInput): Promise<Review>;
  updateReviewStatus(id: string, status: 'approved' | 'pending' | 'rejected'): Promise<Review>;
  voteHelpful(id: string): Promise<Review>;
}
