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
    <div class="h-full group relative flex flex-col items-start transition-all duration-500 bg-[#fbf9f6] dark:bg-[#151b2b] border border-[#241006]/10 dark:border-white/10 hover:border-primary/50 rounded-3xl p-3.5 shadow-lg shadow-black/5 hover:shadow-2xl hover:-translate-y-1.5">
      <!-- Image Container -->
      <div class="relative w-full aspect-[4/3] sm:aspect-square overflow-hidden rounded-2xl bg-[#e8e6e1] dark:bg-[#0f172a] mb-4 cursor-pointer" (click)="handleImageClick()">
        <img
          [src]="item.image || '/hero.png'"
          [alt]="item.name"
          loading="lazy"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
        />
        
        <!-- Floating Price Tag over Image -->
        <div class="absolute top-3 left-3 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-white/20 dark:border-white/10 transition-transform group-hover:scale-105">
          <span class="text-xs sm:text-sm font-black text-[#241006] dark:text-white tracking-wide">
            \${{ item.price | number:'1.2-2' }}
          </span>
        </div>

        <div *ngIf="item.discount" class="absolute top-3 right-3 bg-destructive text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md animate-pulse-soft">
          Sale
        </div>
      </div>
      
      <!-- Text Details -->
      <div class="px-2 w-full flex flex-col flex-1">
        <div class="flex justify-between items-start w-full">
          <div class="flex-1 min-w-0 pr-3">
            <p class="text-[10px] font-black text-primary uppercase tracking-widest mb-1 m-0 line-clamp-1">
              {{ item.category?.name || 'Artisan Selection' }}
            </p>
            <h2 class="text-base sm:text-lg font-black tracking-tight text-[#241006] dark:text-white uppercase leading-tight line-clamp-2 m-0 group-hover:text-primary transition-colors cursor-pointer" (click)="handleImageClick()">
              {{ item.name }}
            </h2>
          </div>
          <!-- Add to cart button (Small) -->
          <button (click)="handleAdd($event)" class="shrink-0 p-2.5 bg-[#241006] dark:bg-primary text-white rounded-xl hover:bg-primary dark:hover:bg-primary/80 transition-colors shadow-md cursor-pointer border-none flex items-center justify-center">
            <lucide-icon name="plus" class="size-4"></lucide-icon>
          </button>
        </div>

        <div class="mt-auto pt-4 flex items-center justify-between w-full border-t border-[#241006]/5 dark:border-white/5">
          <div class="flex items-center gap-1.5">
            <lucide-icon name="star" class="size-3.5 text-amber-500 fill-amber-500"></lucide-icon>
            <span class="text-xs font-bold text-[#241006] dark:text-white">4.9</span>
            <span class="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider ml-1">(128)</span>
          </div>
          <span *ngIf="!item.isAvailable" class="text-[10px] font-black uppercase tracking-widest text-destructive">
            Sold Out
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
