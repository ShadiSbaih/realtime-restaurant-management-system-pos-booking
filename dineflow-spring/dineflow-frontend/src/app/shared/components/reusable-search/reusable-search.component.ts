import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';

@Component({
  selector: 'app-reusable-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="relative w-full" [ngClass]="className">
      <lucide-icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"></lucide-icon>
      <input
        type="text"
        [placeholder]="'Search ' + title + '...'"
        [ngModel]="search"
        (ngModelChange)="onSearchChange($event)"
        class="w-full bg-transparent border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
      />
    </div>
  `
})
export class ReusableSearchComponent {
  @Input() search: string = '';
  @Input() title: string = 'Item';
  @Input() className: string = '';
  @Output() searchChange = new EventEmitter<string>();

  readonly Search = Search;

  onSearchChange(val: string) {
    this.searchChange.emit(val);
  }
}
