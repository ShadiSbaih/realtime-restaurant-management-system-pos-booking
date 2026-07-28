import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../../core/services/menu.service';
import { Category } from '../../../../core/models/menu.model';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-filter-category',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="relative w-full">
      <div class="flex items-center gap-sm overflow-x-auto no-scrollbar scroll-smooth pb-1" style="scrollbar-width: none; -ms-overflow-style: none;">
        <!-- All Button -->
        <button
          (click)="selectCategory(null)"
          class="flex-shrink-0 px-md py-sm rounded-full text-button-sm transition-colors cursor-pointer"
          [ngClass]="selectedCategoryId === null 
            ? 'bg-ink text-canvas' 
            : 'bg-transparent text-charcoal hover:bg-surface-bone'"
        >
          All
        </button>

        <!-- Category Buttons -->
        <button
          *ngFor="let category of categories"
          (click)="selectCategory(category.id)"
          class="flex-shrink-0 px-md py-sm rounded-full text-button-sm transition-colors cursor-pointer"
          [ngClass]="selectedCategoryId === category.id 
            ? 'bg-ink text-canvas' 
            : 'bg-transparent text-charcoal hover:bg-surface-bone'"
        >
          {{ category.name }}
        </button>
      </div>
    </div>
  `
})
export class FilterCategoryComponent implements OnInit {
  @Input() selectedCategoryId: string | null = null;
  @Output() selectedCategoryIdChange = new EventEmitter<string | null>();

  categories: Category[] = [];
  
  menuService = inject(MenuService);
  
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  ngOnInit() {
    this.menuService.getCategories().subscribe({
      next: (res) => {
        this.categories = res;
      },
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  selectCategory(id: string | null) {
    this.selectedCategoryIdChange.emit(id);
  }
}
