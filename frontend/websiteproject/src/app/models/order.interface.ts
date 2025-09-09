export interface OrderItem {
  item: import('./breakfast-item.interface').BreakfastItem;
  quantity: number;
  subtotal: number;
}

export interface Order {
  items: OrderItem[];
  total: number;
  timestamp: Date;
  id: string;
}

export type Language = 'en' | 'fr';
