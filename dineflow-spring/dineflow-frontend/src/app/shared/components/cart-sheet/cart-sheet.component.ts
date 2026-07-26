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
         class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99990] transition-opacity" 
         (click)="cartService.closeCart()">
    </div>

    <!-- Sheet Panel (Elevated high-contrast drawer so boundaries are unmistakable) -->
    <div *ngIf="cartService.isOpen()"
         class="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-white dark:bg-[#131b2e] border-l-2 border-[#241006]/15 dark:border-white/15 z-[99999] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.7)] animate-in slide-in-from-right duration-300">
      
      <!-- Header -->
      <div class="p-5 flex items-center justify-between border-b border-border/80 bg-white dark:bg-[#131b2e] shrink-0">
        <h1 class="text-2xl font-black uppercase tracking-tighter text-[#241006] dark:text-white m-0">
          Order <span class="text-primary">Summary</span>
        </h1>
        <button (click)="cartService.closeCart()" class="p-2 rounded-full hover:bg-muted/80 transition-colors text-[#241006] dark:text-white border-none bg-transparent cursor-pointer flex items-center justify-center">
          <lucide-icon name="x" class="size-5"></lucide-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-5 bg-white dark:bg-[#131b2e]">
        <div *ngIf="cartService.items().length === 0" class="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
          <lucide-icon name="shopping-cart" class="size-16 mb-4 text-[#241006] dark:text-white"></lucide-icon>
          <h2 class="text-xl font-black uppercase text-[#241006] dark:text-white m-0">Order is empty</h2>
          <p class="text-sm mt-1 font-bold">Add some items to start</p>
        </div>

        <div *ngIf="cartService.items().length > 0" class="flex flex-col h-full">
          <!-- Order Type Toggle -->
          <div class="flex gap-2 mb-6 justify-end">
            <button 
              [ngClass]="cartService.type() === 'dine-in' ? 'bg-primary text-white shadow-md' : 'bg-transparent border border-[#241006]/20 dark:border-white/20 text-[#241006] dark:text-white hover:bg-muted'"
              (click)="cartService.setType('dine-in')"
              class="px-5 py-2 rounded-full uppercase font-black text-xs transition-all cursor-pointer">
              Dine In
            </button>
            <button 
              [ngClass]="cartService.type() === 'take-away' ? 'bg-primary text-white shadow-md' : 'bg-transparent border border-[#241006]/20 dark:border-white/20 text-[#241006] dark:text-white hover:bg-muted'"
              (click)="cartService.setType('take-away')"
              class="px-5 py-2 rounded-full uppercase font-black text-xs transition-all cursor-pointer">
              Take Away
            </button>
          </div>

          <!-- Items List -->
          <div class="space-y-3.5">
            <div *ngFor="let item of cartService.items(); let i = index" class="flex justify-between items-center border border-border/80 rounded-2xl p-3.5 bg-[#f9f9f8] dark:bg-[#0f172a] shadow-sm text-foreground transition-all hover:border-primary/40">
              <div class="flex items-center gap-3.5">
                <img [src]="item.image" class="size-14 rounded-xl object-cover shadow-sm" alt="">
                <div>
                  <p class="font-black text-sm uppercase leading-tight text-[#241006] dark:text-white m-0 line-clamp-1">{{ item.name }}</p>
                  <p class="font-black text-primary text-xs mt-0.5 m-0">\${{ item.price | number:'1.2-2' }}</p>
                  <div class="flex gap-3 items-center mt-2.5">
                    <button (click)="cartService.updateQuantity(item.id, -1)" class="p-1.5 bg-white dark:bg-slate-800 border border-border rounded-lg hover:bg-primary hover:text-white transition-colors cursor-pointer text-[#241006] dark:text-white flex items-center justify-center">
                      <lucide-icon name="minus" class="size-3"></lucide-icon>
                    </button>
                    <span class="font-black text-xs text-[#241006] dark:text-white">{{ item.quantity }}</span>
                    <button (click)="cartService.updateQuantity(item.id, 1)" class="p-1.5 bg-white dark:bg-slate-800 border border-border rounded-lg hover:bg-primary hover:text-white transition-colors cursor-pointer text-[#241006] dark:text-white flex items-center justify-center">
                      <lucide-icon name="plus" class="size-3"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>
              <button (click)="cartService.removeItem(i)" class="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center" title="Remove Item">
                <lucide-icon name="trash" class="size-4"></lucide-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Totals & Actions (Elevated container with clear separation) -->
      <div *ngIf="cartService.items().length > 0" class="border-t-2 border-border/80 p-5 bg-[#f4f4f2] dark:bg-[#0b0f19] mt-auto shrink-0 shadow-2xl">
        <div class="flex justify-between items-center mb-5 text-[#241006] dark:text-white">
          <p class="text-sm font-black uppercase tracking-wider m-0">Total</p>
          <p class="text-3xl font-black text-primary m-0">\${{ cartService.total() | number:'1.2-2' }}</p>
        </div>
        <div class="flex flex-col gap-3">
          <button class="w-full flex items-center justify-center gap-2.5 bg-primary text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 hover:scale-[1.01] transition-all cursor-pointer border-none shadow-lg shadow-primary/25">
            <lucide-icon name="printer" class="size-4"></lucide-icon> Place Order
          </button>
          <button class="w-full flex items-center justify-center gap-2.5 bg-[#241006] dark:bg-white text-white dark:text-[#241006] h-14 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.01] transition-all cursor-pointer border-none shadow-lg">
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

  readonly ShoppingCart = ShoppingCart;
  readonly Minus = Minus;
  readonly Plus = Plus;
  readonly Trash = Trash;
  readonly Loader2 = Loader2;
  readonly Printer = Printer;
  readonly CreditCard = CreditCard;
  readonly X = X;
}
