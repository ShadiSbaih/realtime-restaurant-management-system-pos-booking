export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Feedback {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  recipe?: string;
  isAvailable: boolean;
  categoryId: string;
  category?: Category;
  discount: number;
  aiSuggestion?: string;
  feedbacks?: Feedback[];
}
