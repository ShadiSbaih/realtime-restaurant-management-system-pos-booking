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
    <div *ngIf="isOpen && item" class="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity" (click)="close()">
      
      <!-- Review Modal Wrapper (Image 1) -->
      <div *ngIf="isReviewing" class="bg-[#121212] border border-[#2A2A2A] w-full max-w-lg rounded-2xl overflow-hidden relative text-white shadow-2xl" (click)="$event.stopPropagation()">
        <div class="p-4 flex items-center justify-between border-b border-[#2A2A2A]">
          <div class="flex items-center gap-2">
            <lucide-icon name="star" class="size-5 text-[#ff4500] fill-[#ff4500]"></lucide-icon>
            <h2 class="text-lg font-bold">Rate this item</h2>
          </div>
          <button (click)="isReviewing = false" class="text-white/50 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
            <lucide-icon name="x" class="size-5"></lucide-icon>
          </button>
        </div>

        <div class="p-6">
          <div class="bg-[#1C1C1C] rounded-xl p-4 border border-[#2A2A2A]">
            <!-- Stars -->
            <div class="flex gap-2 mb-4">
              <button *ngFor="let star of [1,2,3,4,5]" (click)="reviewRating = star" class="bg-transparent border-none cursor-pointer p-0 transition-transform hover:scale-110">
                <lucide-icon name="star" class="size-6" [ngClass]="star <= reviewRating ? 'text-[#ffb400] fill-[#ffb400]' : 'text-white/20'"></lucide-icon>
              </button>
            </div>
            <!-- Input -->
            <textarea
              [(ngModel)]="reviewComment"
              placeholder="Leave a comment..."
              class="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#ff4500] min-h-[100px] resize-none"
            ></textarea>
          </div>
          
          <button (click)="submitReview()" [disabled]="isSubmitting" class="w-full mt-4 bg-[#8B3A2B] hover:bg-[#A64B3A] text-white/90 font-medium py-3 rounded-xl transition-colors border-none cursor-pointer disabled:opacity-50">
            {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
          </button>
        </div>
      </div>

      <!-- Detail Modal Wrapper (Image 2) -->
      <div *ngIf="!isReviewing" class="bg-[#0b0f19] border border-[#1e293b] w-full max-w-2xl rounded-3xl overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]" (click)="$event.stopPropagation()">
        
        <!-- Close Button (Absolute) -->
        <button (click)="close()" class="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors border-none cursor-pointer backdrop-blur-md">
          <lucide-icon name="x" class="size-5"></lucide-icon>
        </button>

        <!-- Image -->
        <div class="relative w-full h-[300px] bg-slate-900 shrink-0">
          <img [src]="item.image || '/hero.png'" [alt]="item.name" class="w-full h-full object-cover" />
          <!-- Gradient Overlay at bottom of image for text readability -->
          <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0b0f19] to-transparent"></div>
        </div>

        <!-- Content Area -->
        <div class="px-6 py-4 flex-1 overflow-y-auto custom-scrollbar">
          <!-- Tags Row -->
          <div class="flex items-center justify-between mb-2">
            <span class="text-[#ff4500] text-xs font-black tracking-widest uppercase">
              Chef's Recommendation
            </span>
            <button (click)="openReview()" class="flex items-center gap-2 bg-[#1e293b] hover:bg-[#334155] text-white/90 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-white/5 cursor-pointer">
              <lucide-icon name="star" class="size-3 text-[#ff4500] fill-[#ff4500]"></lucide-icon>
              Leave Feedback
            </button>
          </div>

          <!-- Title & Price -->
          <div class="flex items-end justify-between mb-4">
            <h1 class="text-4xl font-black text-white uppercase tracking-tight m-0 leading-none">{{ item.name }}</h1>
            <span class="text-3xl font-black text-white m-0 leading-none">\${{ item.price | number:'1.2-2' }}</span>
          </div>

          <!-- Rating & Reviews -->
          <div class="flex items-center gap-3 mb-6">
            <div class="flex items-center gap-1 bg-[#1e293b] px-2 py-0.5 rounded-md">
              <lucide-icon name="star" class="size-3 text-[#ffb400] fill-[#ffb400]"></lucide-icon>
              <span class="text-white text-xs font-bold">4.0</span>
            </div>
            <span class="text-white/50 text-xs font-bold uppercase tracking-wider">{{ item.feedbacks?.length || 0 }} Reviews</span>
          </div>

          <!-- Description -->
          <p class="text-white/70 text-sm leading-relaxed mb-6 font-medium">
            {{ item.recipe || 'Enjoy our delicious ' + item.name + ', crafted with the finest ingredients to satisfy your cravings. Perfect for any meal of the day.' }}
          </p>

        </div>

        <!-- Bottom Action Bar -->
        <div class="p-6 pt-4 border-t border-[#1e293b] bg-[#0b0f19] shrink-0">
          <div class="flex gap-4">
            <button (click)="addToCart()" class="flex-1 bg-white hover:bg-slate-200 text-[#0b0f19] font-black uppercase tracking-widest py-4 rounded-2xl transition-transform active:scale-95 border-none cursor-pointer flex items-center justify-center gap-2">
              <lucide-icon name="plus" class="size-4"></lucide-icon>
              Add To Order
            </button>
            <button class="bg-[#ff4500]/10 text-[#ff4500] font-black uppercase tracking-widest px-6 py-4 rounded-2xl border border-[#ff4500]/20 flex items-center justify-center cursor-default">
              Save \${{ item.discount || '0.00' }}
            </button>
          </div>
        </div>
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
      background: #1e293b;
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
