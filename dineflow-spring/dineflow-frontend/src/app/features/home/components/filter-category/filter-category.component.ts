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
    <div class="relative w-full mt-6 px-4">
      <div class="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-4" style="scrollbar-width: none; -ms-overflow-style: none;">
        <!-- All Button -->
        <button
          (click)="selectCategory(null)"
          class="flex-shrink-0 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer border shadow-sm"
          [ngClass]="selectedCategoryId === null 
            ? 'bg-[#241006] dark:bg-primary text-white border-[#241006] dark:border-primary shadow-lg shadow-black/10 scale-105' 
            : 'bg-[#fbf9f6] dark:bg-slate-800 text-[#241006] dark:text-white border-[#241006]/10 dark:border-white/10 hover:border-primary/50 hover:bg-white hover:shadow-md'"
        >
          All
        </button>

        <!-- Category Buttons -->
        <button
          *ngFor="let category of categories"
          (click)="selectCategory(category.id)"
          class="flex-shrink-0 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer border shadow-sm"
          [ngClass]="selectedCategoryId === category.id 
            ? 'bg-[#241006] dark:bg-primary text-white border-[#241006] dark:border-primary shadow-lg shadow-black/10 scale-105' 
            : 'bg-[#fbf9f6] dark:bg-slate-800 text-[#241006] dark:text-white border-[#241006]/10 dark:border-white/10 hover:border-primary/50 hover:bg-white hover:shadow-md'"
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
