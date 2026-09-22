import { CategoryType } from './product';

export interface Category {
  id: string;
  name: string;
  slug: CategoryType;
  tagline: string;
  description: string;
  image: string;
  heroImage: string;
  itemCount: number;
  featured: boolean;
}
