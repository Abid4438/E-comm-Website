export interface Review {
  id: string;
  productId: string;
  productName: string;
  author: string;
  avatar?: string;
  location?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  status: 'approved' | 'pending' | 'rejected';
  helpfulCount: number;
  images?: string[];
}

export interface CreateReviewInput {
  productId: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  location?: string;
}
