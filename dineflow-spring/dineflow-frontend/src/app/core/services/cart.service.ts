import { Injectable, signal, computed } from '@angular/core';
import { MenuItem } from '../models/menu.model';

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderType = 'dine-in' | 'take-away';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Using Signals for reactivity
  items = signal<CartItem[]>([]);
  type = signal<OrderType>('dine-in');
  
  // Example for table selection if needed
  table = signal<any | null>(null);

  // Computed total
  total = computed(() => {
    return this.items().reduce((acc, item) => acc + (item.price * item.quantity), 0);
  });

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      const state = {
        items: this.items(),
        type: this.type(),
        table: this.table()
      };
      localStorage.setItem('dineflow-cart', JSON.stringify(state));
    }
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dineflow-cart');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.items.set(Array.isArray(parsed.items) ? parsed.items : []);
          this.type.set(parsed.type || 'dine-in');
          this.table.set(parsed.table || null);
        }
      } catch (e) {
        console.error('Failed to load cart from storage', e);
      }
    }
  }

  addItem(product: MenuItem) {
    this.items.update(currentItems => {
      const existing = currentItems.find(item => item.id === product.id);
      if (existing) {
        return currentItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentItems, { ...product, quantity: 1 }];
    });
    this.saveToStorage();
  }

  updateQuantity(id: string, amount: number) {
    this.items.update(currentItems => {
      return currentItems.map(item => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + amount };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
    this.saveToStorage();
  }

  removeItem(index: number) {
    this.items.update(currentItems => {
      const newItems = [...currentItems];
      newItems.splice(index, 1);
      return newItems;
    });
    this.saveToStorage();
  }

  setType(orderType: OrderType) {
    this.type.set(orderType);
    this.saveToStorage();
  }

  setTable(table: any | null) {
    this.table.set(table);
    this.saveToStorage();
  }

  reset() {
    this.items.set([]);
    this.type.set('dine-in');
    this.table.set(null);
    this.saveToStorage();
  }
}
