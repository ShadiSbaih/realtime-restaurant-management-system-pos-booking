import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItem } from '../../../../core/models/menu.model';
import { CartService } from '../../../../core/services/cart.service';
import { MenuService } from '../../../../core/services/menu.service';
import { LucideAngularModule, X, Star, MessageSquare } from 'lucide-angular';

@Component({
  selector: 'app-item-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Backdrop -->
    <div *ngIf="isOpen && item" class="fixed inset-0 z-[100] bg-ink/30 backdrop-blur-sm transition-opacity" (click)="close()"></div>
    
    <!-- Detail Side Sheet Wrapper (Slides from right) -->
    <div *ngIf="isOpen && item" class="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-canvas border-l border-hairline z-[110] shadow-lg flex flex-col animate-in slide-in-from-right duration-300">
      
      <!-- Review Overlay -->
      <div *ngIf="isReviewing" class="absolute inset-0 bg-canvas z-[120] flex flex-col">
        <div class="p-lg flex items-center justify-between border-b border-hairline">
          <div class="flex items-center gap-xs text-ink">
            <lucide-icon name="star" class="size-5 text-charcoal"></lucide-icon>
            <h2 class="text-heading-md m-0">Rate this item</h2>
          </div>
          <button (click)="isReviewing = false" class="button-icon text-mute hover:text-ink">
            <lucide-icon name="x" class="size-6"></lucide-icon>
          </button>
        </div>

        <div class="p-xl flex-1 flex flex-col">
          <div class="bg-surface-bone rounded-md p-lg border border-hairline">
            <!-- Stars -->
            <div class="flex gap-sm mb-lg justify-center">
              <button *ngFor="let star of [1,2,3,4,5]" (click)="reviewRating = star" class="bg-transparent border-none cursor-pointer p-0 transition-transform hover:scale-110">
                <lucide-icon name="star" class="size-8" [ngClass]="star <= reviewRating ? 'text-charcoal fill-charcoal' : 'text-mute'"></lucide-icon>
              </button>
            </div>
            <!-- Input -->
            <textarea
              [(ngModel)]="reviewComment"
              placeholder="Leave a comment about this meal..."
              class="w-full bg-canvas border border-hairline rounded-md p-md text-ink text-body-sm focus:outline-none focus:border-[#333] min-h-[120px] resize-none"
            ></textarea>
          </div>
          
          <button (click)="submitReview()" [disabled]="isSubmitting" class="mt-auto w-full button-dark">
            {{ isSubmitting ? 'Submitting...' : 'Submit Feedback' }}
          </button>
        </div>
      </div>

      <!-- Close Button (Header) -->
      <div class="absolute top-md right-md z-[115]">
        <button (click)="close()" class="bg-surface-dark/80 hover:bg-surface-deep text-on-dark backdrop-blur-sm rounded-full p-xs transition-colors border border-[#333] cursor-pointer shadow-sm flex items-center justify-center">
          <lucide-icon name="x" class="size-5"></lucide-icon>
        </button>
      </div>

      <!-- Image -->
      <div class="relative w-full h-[320px] bg-surface-bone shrink-0">
        <img [src]="item.image || '/hero.png'" [alt]="item.name" class="w-full h-full object-cover" />
      </div>

      <!-- Content Area -->
      <div class="px-xl py-lg flex-1 overflow-y-auto custom-scrollbar bg-canvas">
        <!-- Tags Row -->
        <div class="flex items-center justify-between mb-md">
          <span class="text-charcoal text-caption-tight bg-surface-bone px-sm py-xs rounded-full border border-hairline">
            {{ item.category?.name || 'Category' }}
          </span>
          <button (click)="openReview()" class="flex items-center gap-xs button-ghost text-caption-tight">
            <lucide-icon name="star" class="size-3 text-charcoal"></lucide-icon>
            Rate
          </button>
        </div>

        <!-- Title & Price -->
        <div class="flex flex-col mb-md">
          <h1 class="text-display-sm text-ink m-0 mb-xs">{{ item.name }}</h1>
          <span class="text-heading-md text-charcoal m-0">\${{ item.price | number:'1.2-2' }}</span>
        </div>

        <!-- Rating & Reviews -->
        <div class="flex items-center gap-md mb-xl">
          <div class="flex items-center gap-xs">
            <lucide-icon name="star" class="size-3 text-charcoal"></lucide-icon>
            <span class="text-ink text-body-sm">4.9</span>
          </div>
          <span class="text-mute text-body-sm">{{ item.feedbacks?.length || 128 }} Reviews</span>
        </div>

        <!-- Description -->
        <div class="text-body-md text-ink m-0">
          <p class="m-0">
            {{ item.recipe || 'Enjoy our delicious ' + item.name + ', crafted with the finest ingredients to satisfy your cravings. Perfect for any meal of the day.' }}
          </p>
        </div>
      </div>

      <!-- Bottom Action Bar -->
      <div class="p-xl border-t border-hairline bg-surface-bone shrink-0">
        <button (click)="addToCart()" class="w-full button-dark flex items-center justify-center gap-sm">
          <lucide-icon name="plus" class="size-4"></lucide-icon>
          Add To Order
        </button>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 10px;
    }
  `]
})
export class ItemDetailModalComponent {
  @Input() isOpen = false;
  @Input() item: MenuItem | null = null;
  @Output() isOpenChange = new EventEmitter<boolean>();

  cartService = inject(CartService);
  menuService = inject(MenuService);

  isReviewing = false;
  reviewRating = 0;
  reviewComment = '';
  isSubmitting = false;

  readonly X = X;
  readonly Star = Star;
  readonly MessageSquare = MessageSquare;

  close() {
    this.isOpen = false;
    this.isReviewing = false;
    this.isOpenChange.emit(false);
  }

  openReview() {
    this.reviewRating = 0;
    this.reviewComment = '';
    this.isReviewing = true;
  }

  submitReview() {
    if (!this.item) return;
    if (this.reviewRating === 0) {
      alert("Please select a rating.");
      return;
    }

    this.isSubmitting = true;
    this.menuService.addFeedback(this.item.id, {
      rating: this.reviewRating,
      comment: this.reviewComment
    }).subscribe({
      next: () => {
        alert("Thank you for your feedback!");
        this.isSubmitting = false;
        this.isReviewing = false;
      },
      error: (err) => {
        console.error(err);
        alert("Failed to submit feedback.");
        this.isSubmitting = false;
      }
    });
  }

  addToCart() {
    if (this.item) {
      this.cartService.addItem(this.item);
      alert(this.item.name + " added to order!");
      this.close();
    }
  }
}
