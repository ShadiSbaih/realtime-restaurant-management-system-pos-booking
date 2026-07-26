import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../../../core/models/menu.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="group relative flex flex-col items-start transition-all duration-300 border border-border/50 rounded-lg p-2">
      <!-- Image Container -->
      <div class="relative w-full aspect-square overflow-hidden rounded-lg bg-[#f3f3f1] dark:bg-slate-900 mb-4 cursor-pointer" (click)="handleImageClick()">
        <img
          [src]="item.image || '/hero.png'"
          [alt]="item.name"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
        />
        
        <!-- Floating Price Tag over Image -->
        <div class="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm">
          <span class="text-sm font-black text-[#241006] dark:text-white">
            \${{ item.price | number:'1.2-2' }}
          </span>
        </div>
        
        <!-- Action Buttons Overlay -->
        <div class="absolute bottom-4 right-4 flex gap-2 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            (click)="handleAdd($event)"
            class="bg-primary hover:bg-primary/90 text-white p-3 rounded-full shadow-xl transition-transform active:scale-95 cursor-pointer border-none"
          >
            <lucide-icon name="plus" class="size-4"></lucide-icon>
          </button>
        </div>
      </div>
      
      <!-- Text Details -->
      <div class="px-2 w-full text-foreground">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl font-black tracking-tight text-[#241006] dark:text-white uppercase leading-none">
              {{ item.name }}
            </h2>
            <p class="text-xs font-bold text-[#241006]/50 dark:text-white/40 uppercase tracking-widest mt-1">
              Fresh Ingredients
            </p>
          </div>

          <span *ngIf="item.discount > 0" class="text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded-full uppercase mt-1">
            -{{ (item.discount / (item.price + item.discount)) * 100 | number:'1.0-0' }}%
          </span>
        </div>
        <!-- Discount Pricing (Bottom) -->
        <div *ngIf="item.discount > 0" class="mt-1 flex items-center gap-2">
          <span class="text-xs text-muted-foreground line-through font-medium">
            \${{ item.price + item.discount | number:'1.2-2' }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class ItemCardComponent {
  @Input({ required: true }) item!: MenuItem;
  @Output() imageClick = new EventEmitter<MenuItem>();

  authService = inject(AuthService);
  cartService = inject(CartService);
  router = inject(Router);

  readonly Plus = Plus;

  handleAdd(event: Event) {
    event.stopPropagation();
    const user = this.authService.currentUser();
    
    if (!user) {
      alert("Please log in to add items to the cart.");
      this.router.navigate(['/login']);
      return;
    }
    
    this.cartService.addItem(this.item);
    alert(this.item.name + " added to cart!");
  }

  handleImageClick() {
    this.imageClick.emit(this.item);
  }
}
