import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { LucideAngularModule, ShoppingCart, Minus, Plus, Trash, Loader2, Printer, CreditCard, X } from 'lucide-angular';

@Component({
  selector: 'app-cart-sheet',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Overlay -->
    <div *ngIf="cartService.isOpen()" 
         class="fixed inset-0 bg-ink/30 backdrop-blur-sm z-[99990] transition-opacity" 
         (click)="cartService.closeCart()">
    </div>

    <!-- Sheet Panel -->
    <div *ngIf="cartService.isOpen()"
         class="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-canvas border-l border-hairline z-[99999] flex flex-col shadow-lg animate-in slide-in-from-right duration-300">
      
      <!-- Header -->
      <div class="p-lg flex items-center justify-between border-b border-hairline bg-surface-bone shrink-0">
        <h1 class="text-heading-lg font-bold uppercase tracking-tighter text-ink m-0">
          Order <span class="text-primary">Summary</span>
        </h1>
        <button (click)="cartService.closeCart()" class="button-icon text-mute hover:text-ink">
          <lucide-icon name="x" class="size-5"></lucide-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-xl bg-canvas custom-scrollbar">
        <div *ngIf="cartService.items().length === 0" class="flex flex-col items-center justify-center h-full text-mute">
          <lucide-icon name="shopping-cart" class="size-10 mb-md text-mute"></lucide-icon>
          <h2 class="text-heading-md font-bold text-ink m-0">Order is empty</h2>
          <p class="text-body-sm mt-xs m-0">Add some items to start</p>
        </div>

        <div *ngIf="cartService.items().length > 0" class="flex flex-col h-full">
          <!-- Order Type Toggle -->
          <div class="flex gap-sm mb-xl justify-end">
            <button 
              [ngClass]="cartService.type() === 'dine-in' ? 'bg-primary text-canvas border border-primary shadow-sm' : 'bg-transparent border border-hairline text-ink hover:bg-surface-bone'"
              (click)="cartService.setType('dine-in')"
              class="px-md py-sm rounded-md uppercase font-bold text-caption-tight transition-colors cursor-pointer">
              Dine In
            </button>
            <button 
              [ngClass]="cartService.type() === 'take-away' ? 'bg-primary text-canvas border border-primary shadow-sm' : 'bg-transparent border border-hairline text-ink hover:bg-surface-bone'"
              (click)="cartService.setType('take-away')"
              class="px-md py-sm rounded-md uppercase font-bold text-caption-tight transition-colors cursor-pointer">
              Take Away
            </button>
          </div>

          <!-- Items List -->
          <div class="space-y-md">
            <div *ngFor="let item of cartService.items(); let i = index" class="flex justify-between items-center border border-hairline rounded-md p-md bg-surface-bone shadow-sm text-ink transition-colors hover:border-[#333]">
              <div class="flex items-center gap-md">
                <img [src]="item.image" class="size-16 rounded-sm object-cover border border-hairline" alt="">
                <div>
                  <p class="font-bold text-body-sm uppercase leading-tight text-ink m-0 line-clamp-1">{{ item.name }}</p>
                  <p class="font-bold text-primary text-caption mt-0.5 m-0">${{ item.price | number:'1.2-2' }}</p>
                  <div class="flex gap-sm items-center mt-sm">
                    <button (click)="cartService.updateQuantity(item.id, -1)" class="button-icon size-7 text-ink border border-hairline bg-canvas">
                      <lucide-icon name="minus" class="size-3"></lucide-icon>
                    </button>
                    <span class="font-bold text-caption text-ink w-4 text-center">{{ item.quantity }}</span>
                    <button (click)="cartService.updateQuantity(item.id, 1)" class="button-icon size-7 text-ink border border-hairline bg-canvas">
                      <lucide-icon name="plus" class="size-3"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>
              <button (click)="cartService.removeItem(i)" class="button-icon size-8 text-mute hover:text-[#e02424] hover:bg-[#e02424]/10" title="Remove Item">
                <lucide-icon name="trash" class="size-4"></lucide-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Totals & Actions -->
      <div *ngIf="cartService.items().length > 0" class="border-t border-hairline p-xl bg-surface-bone mt-auto shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div class="flex justify-between items-center mb-xl text-ink">
          <p class="text-caption font-bold uppercase tracking-wider m-0">Total</p>
          <p class="text-display-sm font-bold text-primary m-0">${{ cartService.total() | number:'1.2-2' }}</p>
        </div>
        <div class="flex flex-col gap-md">
          <button class="w-full button-primary flex items-center justify-center gap-sm h-[48px]">
            <lucide-icon name="printer" class="size-4"></lucide-icon> Place Order
          </button>
          <button class="w-full button-dark flex items-center justify-center gap-sm h-[48px]">
            <lucide-icon name="credit-card" class="size-4"></lucide-icon> Pay Securely with Stripe
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

  readonly ShoppingCart = ShoppingCart;
  readonly Minus = Minus;
  readonly Plus = Plus;
  readonly Trash = Trash;
  readonly Loader2 = Loader2;
  readonly Printer = Printer;
  readonly CreditCard = CreditCard;
  readonly X = X;
}
