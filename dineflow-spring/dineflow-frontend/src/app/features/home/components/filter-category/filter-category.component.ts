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
    <div class="relative w-full overflow-hidden mt-6 px-4">
      <!-- Left fade/scroll button (optional, simplified for tailwind) -->
      
      <div class="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-4" style="scrollbar-width: none; -ms-overflow-style: none;">
        <!-- All Button -->
        <button
          (click)="selectCategory(null)"
          class="flex-shrink-0 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer border"
          [ngClass]="selectedCategoryId === null 
            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105' 
            : 'bg-white dark:bg-slate-800 text-[#241006] dark:text-white border-border/80 hover:border-primary/50 shadow-sm hover:scale-[1.02]'"
        >
          All
        </button>

        <!-- Category Buttons -->
        <button
          *ngFor="let category of categories"
          (click)="selectCategory(category.id)"
          class="flex-shrink-0 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer border"
          [ngClass]="selectedCategoryId === category.id 
            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105' 
            : 'bg-white dark:bg-slate-800 text-[#241006] dark:text-white border-border/80 hover:border-primary/50 shadow-sm hover:scale-[1.02]'"
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
