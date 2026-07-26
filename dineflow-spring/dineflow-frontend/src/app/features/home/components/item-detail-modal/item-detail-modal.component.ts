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
    <div *ngIf="isOpen && item" class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity" (click)="close()"></div>
    
    <!-- Detail Side Sheet Wrapper (Slides from right) -->
    <div *ngIf="isOpen && item" class="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-white dark:bg-[#131b2e] border-l border-[#241006]/10 dark:border-white/10 z-[110] shadow-[0_0_50px_rgba(0,0,0,0.7)] flex flex-col animate-in slide-in-from-right duration-300">
      
      <!-- Review Overlay -->
      <div *ngIf="isReviewing" class="absolute inset-0 bg-white dark:bg-[#131b2e] z-[120] flex flex-col">
        <div class="p-5 flex items-center justify-between border-b border-[#241006]/10 dark:border-white/10">
          <div class="flex items-center gap-2 text-[#241006] dark:text-white">
            <lucide-icon name="star" class="size-5 text-primary fill-primary"></lucide-icon>
            <h2 class="text-lg font-black uppercase m-0 tracking-tight">Rate this item</h2>
          </div>
          <button (click)="isReviewing = false" class="text-[#241006]/50 dark:text-white/50 hover:text-[#241006] dark:hover:text-white bg-transparent border-none cursor-pointer">
            <lucide-icon name="x" class="size-6"></lucide-icon>
          </button>
        </div>

        <div class="p-6 flex-1 flex flex-col">
          <div class="bg-[#f4f4f2] dark:bg-[#0b0f19] rounded-2xl p-5 border border-[#241006]/10 dark:border-white/10">
            <!-- Stars -->
            <div class="flex gap-2 mb-5 justify-center">
              <button *ngFor="let star of [1,2,3,4,5]" (click)="reviewRating = star" class="bg-transparent border-none cursor-pointer p-0 transition-transform hover:scale-110">
                <lucide-icon name="star" class="size-8" [ngClass]="star <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-[#241006]/20 dark:text-white/20'"></lucide-icon>
              </button>
            </div>
            <!-- Input -->
            <textarea
              [(ngModel)]="reviewComment"
              placeholder="Leave a comment about this meal..."
              class="w-full bg-white dark:bg-slate-900 border border-[#241006]/10 dark:border-white/10 rounded-xl p-4 text-[#241006] dark:text-white text-sm focus:outline-none focus:border-primary min-h-[120px] resize-none font-medium"
            ></textarea>
          </div>
          
          <button (click)="submitReview()" [disabled]="isSubmitting" class="mt-auto w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-colors border-none cursor-pointer disabled:opacity-50 shadow-lg shadow-primary/20">
            {{ isSubmitting ? 'Submitting...' : 'Submit Feedback' }}
          </button>
        </div>
      </div>

      <!-- Close Button (Header) -->
      <div class="absolute top-4 right-4 z-[115]">
        <button (click)="close()" class="bg-black/50 hover:bg-black/70 text-white backdrop-blur-md rounded-full p-2 transition-colors border border-white/20 cursor-pointer shadow-md flex items-center justify-center">
          <lucide-icon name="x" class="size-5"></lucide-icon>
        </button>
      </div>

      <!-- Image -->
      <div class="relative w-full h-[320px] bg-[#f4f4f2] dark:bg-slate-900 shrink-0">
        <img [src]="item.image || '/hero.png'" [alt]="item.name" class="w-full h-full object-cover" />
        <!-- Gradient Overlay -->
        <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-[#131b2e] to-transparent"></div>
      </div>

      <!-- Content Area -->
      <div class="px-6 py-4 flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#131b2e]">
        <!-- Tags Row -->
        <div class="flex items-center justify-between mb-3">
          <span class="text-primary text-[10px] font-black tracking-widest uppercase bg-primary/10 px-2 py-1 rounded-md">
            {{ item.category?.name || 'Chef\\'s Recommendation' }}
          </span>
          <button (click)="openReview()" class="flex items-center gap-1.5 bg-[#f4f4f2] dark:bg-[#0b0f19] hover:bg-[#e4e4e1] dark:hover:bg-slate-800 text-[#241006] dark:text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors border border-[#241006]/10 dark:border-white/10 cursor-pointer">
            <lucide-icon name="star" class="size-3 text-amber-500 fill-amber-500"></lucide-icon>
            Rate
          </button>
        </div>

        <!-- Title & Price -->
        <div class="flex flex-col mb-4">
          <h1 class="text-3xl font-black text-[#241006] dark:text-white uppercase tracking-tight m-0 leading-tight mb-2">{{ item.name }}</h1>
          <span class="text-2xl font-black text-primary m-0 leading-none">\${{ item.price | number:'1.2-2' }}</span>
        </div>

        <!-- Rating & Reviews -->
        <div class="flex items-center gap-3 mb-6">
          <div class="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-md">
            <lucide-icon name="star" class="size-3 text-amber-500 fill-amber-500"></lucide-icon>
            <span class="text-amber-600 dark:text-amber-500 text-xs font-black">4.9</span>
          </div>
          <span class="text-muted-foreground text-[10px] font-black uppercase tracking-wider">{{ item.feedbacks?.length || 128 }} Reviews</span>
        </div>

        <!-- Description -->
        <div class="prose prose-sm dark:prose-invert max-w-none">
          <p class="text-[#241006]/70 dark:text-white/70 text-sm leading-relaxed font-medium m-0">
            {{ item.recipe || 'Enjoy our delicious ' + item.name + ', crafted with the finest ingredients to satisfy your cravings. Perfect for any meal of the day.' }}
          </p>
        </div>
      </div>

      <!-- Bottom Action Bar -->
      <div class="p-6 pt-4 border-t border-[#241006]/5 dark:border-white/5 bg-[#fbf9f6] dark:bg-[#0b0f19] shrink-0">
        <div class="flex gap-4">
          <button (click)="addToCart()" class="flex-1 bg-[#241006] dark:bg-primary hover:bg-[#241006]/90 dark:hover:bg-primary/90 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-transform active:scale-95 border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg">
            <lucide-icon name="plus" class="size-4"></lucide-icon>
            Add To Order
          </button>
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
