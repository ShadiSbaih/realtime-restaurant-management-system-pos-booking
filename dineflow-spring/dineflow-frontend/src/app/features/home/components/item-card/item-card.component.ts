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
    <div class="group relative flex flex-col items-start transition-all duration-300 bg-white dark:bg-[#1f2937] border border-border/80 hover:border-primary/50 rounded-2xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-1">
      <!-- Image Container -->
      <div class="relative w-full aspect-square overflow-hidden rounded-xl bg-[#f3f3f1] dark:bg-slate-900 mb-3.5 cursor-pointer" (click)="handleImageClick()">
        <img
          [src]="item.image || '/hero.png'"
          [alt]="item.name"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
        />
        
        <!-- Floating Price Tag over Image -->
        <div class="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-white/20">
          <span class="text-xs font-black text-[#241006] dark:text-white">
            \${{ item.price | number:'1.2-2' }}
          </span>
        </div>
        
        <!-- Action Buttons Overlay -->
        <div class="absolute bottom-3 right-3 flex gap-2 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            (click)="handleAdd($event)"
            class="bg-primary hover:bg-primary/90 text-white p-3 rounded-full shadow-xl transition-transform active:scale-95 cursor-pointer border-none flex items-center justify-center"
            title="Add to Cart"
          >
            <lucide-icon name="plus" class="size-4"></lucide-icon>
          </button>
        </div>
      </div>
      
      <!-- Text Details -->
      <div class="px-1.5 w-full text-foreground">
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0 pr-2">
            <h2 class="text-base font-black tracking-tight text-[#241006] dark:text-white uppercase leading-tight truncate m-0">
              {{ item.name }}
            </h2>
            <p class="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1 m-0">
              Fresh Ingredients
            </p>
          </div>

          <span *ngIf="item.discount > 0" class="text-[10px] font-black bg-primary/15 text-primary px-2 py-0.5 rounded-full uppercase mt-0.5 shrink-0">
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
