import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BreakfastItem, BreakfastCategory } from '../models/breakfast-item.interface';
import { OrderItem, Order } from '../models/order.interface';

@Injectable({
  providedIn: 'root'
})
export class BreakfastService {
  private orderItems = new BehaviorSubject<OrderItem[]>([]);
  private orderTotal = new BehaviorSubject<number>(0);

  private readonly breakfastData: BreakfastCategory[] = [
    {
      id: 'main',
      name: 'main',
      nameTranslations: { en: 'Main Dishes', fr: 'Plats Principaux' },
      items: [
        {
          id: 1,
          name: 'pancakes',
          nameTranslations: { en: 'Pancakes', fr: 'Crêpes' },
          price: 8.99,
          category: 'main',
          descriptionTranslations: {
            en: 'Fluffy pancakes served with maple syrup',
            fr: 'Crêpes moelleuses servies avec sirop d\'érable'
          },
          available: true
        },
        {
          id: 2,
          name: 'eggs_benedict',
          nameTranslations: { en: 'Eggs Benedict', fr: 'Œufs Bénédicte' },
          price: 12.99,
          category: 'main',
          descriptionTranslations: {
            en: 'Poached eggs on English muffin with hollandaise sauce',
            fr: 'Œufs pochés sur muffin anglais avec sauce hollandaise'
          },
          available: true
        },
        {
          id: 3,
          name: 'french_toast',
          nameTranslations: { en: 'French Toast', fr: 'Pain Doré' },
          price: 9.99,
          category: 'main',
          descriptionTranslations: {
            en: 'Thick cut brioche with cinnamon and vanilla',
            fr: 'Brioche épaisse à la cannelle et vanille'
          },
          available: true
        },
        {
          id: 4,
          name: 'omelette',
          nameTranslations: { en: 'Omelette', fr: 'Omelette' },
          price: 10.99,
          category: 'main',
          descriptionTranslations: {
            en: 'Three-egg omelette with your choice of fillings',
            fr: 'Omelette aux trois œufs avec garnitures au choix'
          },
          available: true
        }
      ]
    },
    {
      id: 'side',
      name: 'side',
      nameTranslations: { en: 'Sides', fr: 'Accompagnements' },
      items: [
        {
          id: 5,
          name: 'bacon',
          nameTranslations: { en: 'Bacon', fr: 'Bacon' },
          price: 3.99,
          category: 'side',
          descriptionTranslations: {
            en: 'Crispy smoked bacon strips',
            fr: 'Tranches de bacon fumé croustillant'
          },
          available: true
        },
        {
          id: 6,
          name: 'sausage',
          nameTranslations: { en: 'Sausage', fr: 'Saucisse' },
          price: 3.99,
          category: 'side',
          descriptionTranslations: {
            en: 'Homemade breakfast sausage links',
            fr: 'Saucisses de petit-déjeuner maison'
          },
          available: true
        },
        {
          id: 7,
          name: 'hash_browns',
          nameTranslations: { en: 'Hash Browns', fr: 'Pommes de Terre Rissolées' },
          price: 2.99,
          category: 'side',
          descriptionTranslations: {
            en: 'Golden crispy potato hash browns',
            fr: 'Pommes de terre rissolées dorées et croustillantes'
          },
          available: true
        },
        {
          id: 8,
          name: 'toast',
          nameTranslations: { en: 'Toast', fr: 'Pain Grillé' },
          price: 1.99,
          category: 'side',
          descriptionTranslations: {
            en: 'Fresh baked bread, choice of white or whole wheat',
            fr: 'Pain frais, choix blanc ou blé entier'
          },
          available: true
        }
      ]
    },
    {
      id: 'drink',
      name: 'drink',
      nameTranslations: { en: 'Drinks', fr: 'Boissons' },
      items: [
        {
          id: 9,
          name: 'coffee',
          nameTranslations: { en: 'Coffee', fr: 'Café' },
          price: 2.99,
          category: 'drink',
          descriptionTranslations: {
            en: 'Freshly brewed coffee',
            fr: 'Café fraîchement moulu'
          },
          available: true
        },
        {
          id: 10,
          name: 'tea',
          nameTranslations: { en: 'Tea', fr: 'Thé' },
          price: 2.49,
          category: 'drink',
          descriptionTranslations: {
            en: 'Selection of premium teas',
            fr: 'Sélection de thés premium'
          },
          available: true
        },
        {
          id: 11,
          name: 'orange_juice',
          nameTranslations: { en: 'Orange Juice', fr: 'Jus d\'Orange' },
          price: 3.99,
          category: 'drink',
          descriptionTranslations: {
            en: 'Fresh squeezed orange juice',
            fr: 'Jus d\'orange fraîchement pressé'
          },
          available: true
        },
        {
          id: 12,
          name: 'milk',
          nameTranslations: { en: 'Milk', fr: 'Lait' },
          price: 1.99,
          category: 'drink',
          descriptionTranslations: {
            en: 'Fresh whole milk',
            fr: 'Lait entier frais'
          },
          available: true
        }
      ]
    },
    {
      id: 'extra',
      name: 'extra',
      nameTranslations: { en: 'Extras', fr: 'Extras' },
      items: [
        {
          id: 13,
          name: 'butter',
          nameTranslations: { en: 'Butter', fr: 'Beurre' },
          price: 0.99,
          category: 'extra',
          descriptionTranslations: {
            en: 'Creamy butter',
            fr: 'Beurre crémeux'
          },
          available: true
        },
        {
          id: 14,
          name: 'jam',
          nameTranslations: { en: 'Jam', fr: 'Confiture' },
          price: 1.49,
          category: 'extra',
          descriptionTranslations: {
            en: 'Homemade strawberry jam',
            fr: 'Confiture de fraises maison'
          },
          available: true
        },
        {
          id: 15,
          name: 'syrup',
          nameTranslations: { en: 'Maple Syrup', fr: 'Sirop d\'Érable' },
          price: 1.99,
          category: 'extra',
          descriptionTranslations: {
            en: 'Pure Canadian maple syrup',
            fr: 'Pur sirop d\'érable canadien'
          },
          available: true
        },
        {
          id: 16,
          name: 'cream',
          nameTranslations: { en: 'Cream', fr: 'Crème' },
          price: 1.49,
          category: 'extra',
          descriptionTranslations: {
            en: 'Fresh dairy cream',
            fr: 'Crème fraîche'
          },
          available: true
        }
      ]
    }
  ];

  constructor() {
    // Load saved order from localStorage
    this.loadOrder();
  }

  get orderItems$(): Observable<OrderItem[]> {
    return this.orderItems.asObservable();
  }

  get orderTotal$(): Observable<number> {
    return this.orderTotal.asObservable();
  }

  getCategories(): BreakfastCategory[] {
    return this.breakfastData;
  }

  getItemsByCategory(category: string): BreakfastItem[] {
    const categoryData = this.breakfastData.find(cat => cat.id === category);
    return categoryData ? categoryData.items : [];
  }

  addToOrder(item: BreakfastItem, quantity: number = 1): void {
    const currentItems = this.orderItems.value;
    const existingItemIndex = currentItems.findIndex(orderItem => orderItem.item.id === item.id);

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].quantity * item.price;
      this.orderItems.next(updatedItems);
    } else {
      // Add new item
      const newOrderItem: OrderItem = {
        item,
        quantity,
        subtotal: item.price * quantity
      };
      this.orderItems.next([...currentItems, newOrderItem]);
    }

    this.updateTotal();
    this.saveOrder();
  }

  removeFromOrder(itemId: number): void {
    const currentItems = this.orderItems.value;
    const updatedItems = currentItems.filter(orderItem => orderItem.item.id !== itemId);
    this.orderItems.next(updatedItems);
    this.updateTotal();
    this.saveOrder();
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromOrder(itemId);
      return;
    }

    const currentItems = this.orderItems.value;
    const updatedItems = currentItems.map(orderItem => {
      if (orderItem.item.id === itemId) {
        return {
          ...orderItem,
          quantity,
          subtotal: orderItem.item.price * quantity
        };
      }
      return orderItem;
    });

    this.orderItems.next(updatedItems);
    this.updateTotal();
    this.saveOrder();
  }

  clearOrder(): void {
    this.orderItems.next([]);
    this.orderTotal.next(0);
    this.saveOrder();
  }

  getItemQuantity(itemId: number): number {
    const orderItem = this.orderItems.value.find(item => item.item.id === itemId);
    return orderItem ? orderItem.quantity : 0;
  }

  placeOrder(): Observable<Order> {
    const order: Order = {
      items: this.orderItems.value,
      total: this.orderTotal.value,
      timestamp: new Date(),
      id: this.generateOrderId()
    };

    // In a real app, this would make an HTTP request to place the order
    // For now, we'll just clear the current order and return the placed order
    this.clearOrder();
    
    return new BehaviorSubject(order).asObservable();
  }

  private updateTotal(): void {
    const total = this.orderItems.value.reduce((sum, item) => sum + item.subtotal, 0);
    this.orderTotal.next(total);
  }

  private saveOrder(): void {
    localStorage.setItem('breakfast-order', JSON.stringify(this.orderItems.value));
  }

  private loadOrder(): void {
    const savedOrder = localStorage.getItem('breakfast-order');
    if (savedOrder) {
      try {
        const orderItems = JSON.parse(savedOrder) as OrderItem[];
        this.orderItems.next(orderItems);
        this.updateTotal();
      } catch (error) {
        console.error('Error loading saved order:', error);
      }
    }
  }

  private generateOrderId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
