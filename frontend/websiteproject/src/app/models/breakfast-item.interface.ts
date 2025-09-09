export interface BreakfastItem {
  id: number;
  name: string;
  nameTranslations: {
    en: string;
    fr: string;
  };
  price: number;
  category: 'main' | 'side' | 'drink' | 'extra';
  image?: string;
  description?: string;
  descriptionTranslations?: {
    en: string;
    fr: string;
  };
  allergens?: string[];
  available: boolean;
}

export interface BreakfastCategory {
  id: string;
  name: string;
  nameTranslations: {
    en: string;
    fr: string;
  };
  items: BreakfastItem[];
}
