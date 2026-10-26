export interface Product {
  id: string;
  name: string;
  category: string;
  price?: number | null;
  priceTk?: number | null;
  originalPrice?: number | null;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: string;
  benefit: string;
  benefits?: string[];
  description?: string;
  ingredients?: string;
  howToUse?: string;
  inStock: boolean;
  skinConcerns?: string[];
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  highlightBadge?: 'best_seller' | 'new';
  facebookPostUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  productName: string;
}

export type CheckoutMode = 'whatsapp' | 'payment' | 'gateway';
