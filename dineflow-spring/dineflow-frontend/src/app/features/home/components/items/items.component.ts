import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableSearchComponent } from '../../../../shared/components/reusable-search/reusable-search.component';
import { FilterCategoryComponent } from '../filter-category/filter-category.component';
import { ItemCardComponent } from '../item-card/item-card.component';
import { ItemDetailModalComponent } from '../item-detail-modal/item-detail-modal.component';
import { MenuService } from '../../../../core/services/menu.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { MenuItem } from '../../../../core/models/menu.model';
import { BehaviorSubject, combineLatest, debounceTime, switchMap, tap } from 'rxjs';
import { LucideAngularModule, Loader2 } from 'lucide-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, ReusableSearchComponent, FilterCategoryComponent, ItemCardComponent, ItemDetailModalComponent, LucideAngularModule],
  template: `
    <div id="menu-header" class="w-full bg-canvas text-ink scroll-mt-24">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-xl mb-xl w-full">
        <!-- Filter Categories (Left) -->
        <div class="flex-1 w-full overflow-hidden">
          <app-filter-category
            [selectedCategoryId]="category$.value"
            (selectedCategoryIdChange)="onCategoryChange($event)"
          ></app-filter-category>
        </div>
        
        <!-- Search and Status (Right) -->
        <div class="flex items-center gap-md shrink-0 w-full lg:w-[400px] justify-end">
          <p *ngIf="!isLoading && unavailableCount > 0" class="text-primary text-body-sm m-0 whitespace-nowrap">
            {{ unavailableCount }} items unavailable
          </p>
          <app-reusable-search
            [search]="search$.value"
            (searchChange)="onSearchChange($event)"
            title="Item"
            className="w-full"
          ></app-reusable-search>
        </div>
      </div>

      <!-- Loading State (Skeletons) -->
      <div *ngIf="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-xl mt-lg mb-xxxl">
        <div *ngFor="let _ of [1,2,3,4,5,6,7,8]" class="flex flex-col items-start w-full">
          <!-- Image skeleton -->
          <div class="w-full aspect-square rounded-md bg-surface-bone animate-pulse mb-md"></div>
          
          <!-- Text details skeleton -->
          <div class="w-full flex flex-col flex-1 gap-xs">
            <div class="flex justify-between items-start w-full gap-sm">
              <div class="flex-1 space-y-xs">
                <div class="h-5 bg-surface-bone rounded animate-pulse w-3/4 mb-xs"></div>
                <div class="h-4 bg-surface-bone rounded animate-pulse w-1/2"></div>
              </div>
              <div class="size-8 rounded-full bg-surface-bone animate-pulse shrink-0"></div>
            </div>
            
            <div class="mt-sm flex justify-between w-full">
               <div class="h-4 bg-surface-bone rounded animate-pulse w-10"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && items.length === 0" class="min-h-[300px] flex flex-col items-center justify-center text-mute">
        <h2 class="text-heading-md text-ink">No Menu Items</h2>
        <p class="mt-2 text-body-md text-mute">There are no menu items to display.</p>
      </div>

      <!-- Items Grid -->
      <main *ngIf="!isLoading && items.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-xl mt-lg mb-xxxl">
        <app-item-card *ngFor="let item of items; trackBy: trackById" [item]="item" (imageClick)="openModal($event)"></app-item-card>
      </main>

      <!-- Detail Modal -->
      <app-item-detail-modal
        [(isOpen)]="isModalOpen"
        [item]="selectedItem"
      ></app-item-detail-modal>

      <!-- Basic Pagination -->
      <div *ngIf="!isLoading && totalPages > 1" class="flex justify-center items-center gap-md my-xl">
        <button 
          [disabled]="page$.value === 1" 
          (click)="changePage(page$.value - 1)"
          class="button-outline disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        <span class="text-body-md text-ink">Page {{ page$.value }} of {{ totalPages }}</span>
        <button 
          [disabled]="page$.value === totalPages" 
          (click)="changePage(page$.value + 1)"
          class="button-outline disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </div>
    </div>
  `
})
export class ItemsComponent implements OnInit {
  menuService = inject(MenuService);
  authService = inject(AuthService);
  router = inject(Router);

  search$ = new BehaviorSubject<string>('');
  category$ = new BehaviorSubject<string | null>(null);
  page$ = new BehaviorSubject<number>(1);

  items: MenuItem[] = [];
  isLoading = false;
  totalPages = 1;
  unavailableCount = 0;

  isModalOpen = false;
  selectedItem: MenuItem | null = null;

  readonly Loader2 = Loader2;

  ngOnInit() {
    combineLatest([
      this.page$,
      this.category$,
      this.search$.pipe(debounceTime(300))
    ]).pipe(
      tap(() => this.isLoading = true),
      switchMap(([page, category, search]) => 
        this.menuService.getMenuItems(page, 8, category || undefined, search || undefined)
      )
    ).subscribe({
      next: (res) => {
        // According to getMenuItems, it returns PaginatedResponse<MenuItem>
        this.items = res.data;
        this.totalPages = res.totalPages;
        this.unavailableCount = this.items.filter(item => item.isAvailable === false).length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load items', err);
        this.isLoading = false;
      }
    });
  }

  onSearchChange(search: string) {
    this.search$.next(search);
    this.page$.next(1); // Reset to page 1 on search
  }

  onCategoryChange(categoryId: string | null) {
    this.category$.next(categoryId);
    this.page$.next(1); // Reset to page 1 on category change
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page$.next(newPage);
    }
  }

  openModal(item: MenuItem) {
    const user = this.authService.currentUser();
    if (!user) {
      alert("Please log in to view item details.");
      this.router.navigate(['/login']);
      return;
    }
    
    this.selectedItem = item;
    this.isModalOpen = true;
  }

  trackById(index: number, item: MenuItem): string {
    return item.id;
  }
}
