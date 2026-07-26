import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { LucideAngularModule, ShoppingCart, Minus, Plus, Trash, Loader2, Printer, CreditCard, X } from 'lucide-angular';

@Component({
  selector: 'app-cart-sheet',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Trigger Button (can be styled externally, but we provide a default wrapper) -->
    <div class="relative cursor-pointer" (click)="openSheet()">
      <lucide-icon name="shopping-cart" class="size-8 text-[#241006] dark:text-white"></lucide-icon>
      <span *ngIf="cartService.items().length > 0" class="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full px-1.5 py-0.5">
        {{ cartService.items().length }}
      </span>
    </div>

    <!-- Overlay -->
    <div *ngIf="isOpen()" 
         class="fixed inset-0 bg-black/50 z-50 transition-opacity" 
         (click)="closeSheet()">
    </div>

    <!-- Sheet Panel -->
    <div class="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background border-l border-border z-[51] flex flex-col transition-transform duration-300 transform shadow-2xl"
         [ngClass]="isOpen() ? 'translate-x-0' : 'translate-x-full'"
         style="transition-property: transform;">
      
      <!-- Header -->
      <div class="p-4 flex items-center justify-between border-b border-border">
        <h1 class="text-2xl font-black uppercase tracking-tighter text-primary">
          Order Summary
        </h1>
        <button (click)="closeSheet()" class="p-2 rounded-full hover:bg-muted transition-colors text-foreground">
          <lucide-icon name="x" class="size-5"></lucide-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <div *ngIf="cartService.items().length === 0" class="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
          <lucide-icon name="shopping-cart" class="size-16 mb-4"></lucide-icon>
          <h2 class="text-xl font-bold uppercase">Order is empty</h2>
          <p class="text-sm">Add some items to start</p>
        </div>

        <div *ngIf="cartService.items().length > 0" class="flex flex-col h-full">
          <!-- Order Type Toggle -->
          <div class="flex gap-2 mb-4 justify-end">
            <button 
              [ngClass]="cartService.type() === 'dine-in' ? 'bg-primary text-primary-foreground' : 'bg-transparent border border-input hover:bg-accent text-foreground'"
              (click)="cartService.setType('dine-in')"
              class="px-4 py-2 rounded-full uppercase font-bold text-xs transition-colors">
              Dine In
            </button>
            <button 
              [ngClass]="cartService.type() === 'take-away' ? 'bg-primary text-primary-foreground' : 'bg-transparent border border-input hover:bg-accent text-foreground'"
              (click)="cartService.setType('take-away')"
              class="px-4 py-2 rounded-full uppercase font-bold text-xs transition-colors">
              Take Away
            </button>
          </div>

          <!-- Items List -->
          <div class="space-y-3">
            <div *ngFor="let item of cartService.items(); let i = index" class="flex justify-between items-center border border-border/50 rounded-lg p-3 bg-card shadow-sm text-foreground">
              <div class="flex items-center gap-3">
                <img [src]="item.image" class="size-14 rounded-xl object-cover" alt="">
                <div>
                  <p class="font-bold text-sm uppercase leading-tight line-clamp-1">{{ item.name }}</p>
                  <p class="font-bold text-primary text-xs">\${{ item.price | number:'1.2-2' }}</p>
                  <div class="flex gap-3 items-center mt-2">
                    <button (click)="cartService.updateQuantity(item.id, -1)" class="p-1 bg-accent rounded-md hover:bg-primary hover:text-white transition-colors cursor-pointer text-foreground border-none">
                      <lucide-icon name="minus" class="size-3"></lucide-icon>
                    </button>
                    <span class="font-black text-xs">{{ item.quantity }}</span>
                    <button (click)="cartService.updateQuantity(item.id, 1)" class="p-1 bg-accent rounded-md hover:bg-primary hover:text-white transition-colors cursor-pointer text-foreground border-none">
                      <lucide-icon name="plus" class="size-3"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>
              <button (click)="cartService.removeItem(i)" class="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer border-none bg-transparent">
                <lucide-icon name="trash" class="size-4"></lucide-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Totals & Actions -->
      <div *ngIf="cartService.items().length > 0" class="border-t border-border p-4 bg-background mt-auto shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div class="flex justify-between items-center mb-4 text-foreground">
          <p class="text-sm font-bold uppercase opacity-50">Total</p>
          <p class="text-3xl font-black text-primary">\${{ cartService.total() | number:'1.2-2' }}</p>
        </div>
        <div class="flex flex-col gap-2">
          <button class="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground h-14 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors cursor-pointer border-none shadow-lg shadow-primary/20">
            <lucide-icon name="printer" class="size-4"></lucide-icon> Place Order
          </button>
          <button class="w-full flex items-center justify-center gap-2 bg-[#241006] dark:bg-white text-white dark:text-primary h-14 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-all cursor-pointer border-none shadow-lg">
            <lucide-icon name="credit-card" class="size-5"></lucide-icon> Pay Securely with Stripe
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CartSheetComponent {
  cartService = inject(CartService);
  
  isOpen = signal(false);

  readonly ShoppingCart = ShoppingCart;
  readonly Minus = Minus;
  readonly Plus = Plus;
  readonly Trash = Trash;
  readonly Loader2 = Loader2;
  readonly Printer = Printer;
  readonly CreditCard = CreditCard;
  readonly X = X;

  openSheet() {
    this.isOpen.set(true);
  }

  closeSheet() {
    this.isOpen.set(false);
  }
}
