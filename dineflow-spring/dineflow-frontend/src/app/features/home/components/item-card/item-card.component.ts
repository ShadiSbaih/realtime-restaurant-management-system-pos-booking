import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../../../core/models/menu.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { LucideAngularModule, Plus, Star, Image as ImageIcon } from 'lucide-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="group relative flex flex-col items-start w-full h-full bg-surface-bone rounded-2xl transition-all duration-300 border border-hairline hover:shadow-md overflow-hidden">
      <!-- Image Container (Edge-to-Edge) -->
      <div class="relative w-full aspect-square bg-canvas cursor-pointer overflow-hidden shrink-0" (click)="handleImageClick()">
        <!-- Loading Skeleton -->
        <div *ngIf="!imageLoaded && !imageError && item.image" class="absolute inset-0 w-full h-full bg-surface-bone animate-pulse"></div>

        <!-- Image Fallback UI -->
        <div *ngIf="imageError || !item.image" class="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-surface-bone border-b border-hairline">
          <lucide-icon [img]="ImageIcon" class="size-10 mb-xs text-mute"></lucide-icon>
          <span class="text-caption-tight text-mute truncate px-2 w-full text-center">{{ item.name }}</span>
        </div>

        <!-- Actual Image -->
        <img
          *ngIf="!imageError && item.image"
          [src]="item.image"
          [alt]="item.name"
          (load)="imageLoaded = true"
          (error)="imageError = true"
          loading="lazy"
          class="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 cursor-pointer"
          [ngClass]="imageLoaded ? 'opacity-100' : 'opacity-0'"
        />
        
        <div *ngIf="item.discount" class="absolute top-3 right-3 bg-primary text-on-primary px-3 py-1 rounded-full text-caption-tight font-bold shadow-sm z-10">
          Sale
        </div>
        
        <!-- Floating Price Badge -->
        <div class="absolute bottom-3 right-3 bg-canvas/90 backdrop-blur-md text-ink px-3 py-1 rounded-full text-body-sm font-extrabold border border-hairline shadow-sm z-10">
          \${{ item.price | number:'1.2-2' }}
        </div>
      </div>
      
      <!-- Text Details (Compact 2-Row Layout) -->
      <div class="w-full flex-1 flex flex-col justify-between px-md pb-md pt-sm">
        <!-- Title & Add Button Row -->
        <div class="flex justify-between items-center w-full gap-2">
          <h2 class="text-heading-md font-bold m-0 line-clamp-1 cursor-pointer hover:text-primary transition-colors flex-1" (click)="handleImageClick()">
            {{ item.name }}
          </h2>
          <!-- Add to Cart Button -->
          <button (click)="handleAdd($event)" class="size-8 rounded-full border border-hairline bg-canvas hover:bg-primary hover:border-primary hover:text-white flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer" title="Add to cart">
            <lucide-icon [img]="Plus" class="size-4"></lucide-icon>
          </button>
        </div>


        <!-- Category & Rating Row (Single Row to reduce height) -->
        <div class="flex items-center justify-between w-full mt-1">
          <div class="flex items-center gap-1.5 text-caption text-mute truncate">
            <span class="truncate font-medium text-charcoal/80">{{ item.category?.name || 'Main Courses' }}</span>
            <span class="text-mute/50">•</span>
            <div class="flex items-center gap-1 text-charcoal font-semibold shrink-0">
              <lucide-icon [img]="Star" class="size-3.5 text-[#f59e0b]" style="fill: currentColor;"></lucide-icon>
              <span>4.9</span>
            </div>
          </div>

          <span *ngIf="item.isAvailable === false" class="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0">
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

  imageError = false;
  imageLoaded = false;

  readonly Plus = Plus;
  readonly Star = Star;
  readonly ImageIcon = ImageIcon;

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
