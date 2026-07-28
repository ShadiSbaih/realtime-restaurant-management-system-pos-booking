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
    <div class="w-full bg-canvas text-ink">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-md">
        <app-reusable-search
          [search]="search$.value"
          (searchChange)="onSearchChange($event)"
          title="Item"
          className="w-full max-w-sm"
        ></app-reusable-search>
        
        <p *ngIf="!isLoading && unavailableCount > 0" class="text-primary text-body-sm m-0">
          {{ unavailableCount }} items unavailable
        </p>
      </div>

      <app-filter-category
        [selectedCategoryId]="category$.value"
        (selectedCategoryIdChange)="onCategoryChange($event)"
      ></app-filter-category>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="min-h-[300px] flex items-center justify-center">
        <lucide-icon name="loader-2" class="size-10 animate-spin text-primary"></lucide-icon>
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
        this.menuService.getMenuItems(page, 20, category || undefined, search || undefined)
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
