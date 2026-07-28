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
    <div class="model-card group relative flex flex-col items-start transition-colors hover:bg-surface-bone">
      <!-- Image Container -->
      <div class="relative w-full aspect-square overflow-hidden rounded-md bg-canvas mb-md cursor-pointer" (click)="handleImageClick()">
        <img
          [src]="item.image || '/hero.png'"
          [alt]="item.name"
          loading="lazy"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
        />
        
        <div *ngIf="item.discount" class="absolute top-2 right-2 bg-primary text-on-primary px-sm py-xs rounded-full text-caption-tight">
          Sale
        </div>
        
        <div class="absolute bottom-2 right-2 bg-surface-card text-ink px-sm py-xs rounded-full text-caption-tight border border-hairline shadow-sm">
          \${{ item.price | number:'1.2-2' }}
        </div>
      </div>
      
      <!-- Text Details -->
      <div class="w-full flex flex-col flex-1">
        <div class="flex justify-between items-start w-full">
          <div class="flex-1 min-w-0 pr-sm">
            <h2 class="text-heading-md m-0 line-clamp-1 cursor-pointer hover:text-primary transition-colors" (click)="handleImageClick()">
              {{ item.name }}
            </h2>
            <p class="text-body-sm text-charcoal mb-sm line-clamp-1">
              {{ item.category?.name || 'Category' }}
            </p>
          </div>
          <!-- Add to cart button -->
          <button (click)="handleAdd($event)" class="button-icon shrink-0">
            <lucide-icon name="plus" class="size-4"></lucide-icon>
          </button>
        </div>

        <div class="mt-auto pt-sm flex items-center justify-between w-full relative">
          <div class="flex items-center gap-xs">
            <lucide-icon name="star" class="size-3 text-charcoal"></lucide-icon>
            <span class="text-body-sm text-charcoal">4.9</span>
          </div>
          <span *ngIf="!item.isAvailable" class="bg-[#2b9a66] text-[#fcfcfc] text-caption rounded-full px-[10px] py-[4px] absolute bottom-0 left-0">
            Running
          </span>
          <span *ngIf="!item.isAvailable" class="bg-primary text-on-primary text-caption rounded-full px-[10px] py-[4px] absolute bottom-0 left-0">
            Out
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
