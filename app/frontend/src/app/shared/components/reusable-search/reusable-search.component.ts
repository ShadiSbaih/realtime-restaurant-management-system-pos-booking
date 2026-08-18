import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';

@Component({
  selector: 'app-reusable-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="relative w-full group" [ngClass]="className">
      <div class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-mute group-focus-within:text-primary transition-colors">
        <lucide-icon [img]="Search" class="size-4.5"></lucide-icon>
      </div>
      <input
        type="text"
        [placeholder]="'Search ' + title + '...'"
        [ngModel]="search"
        (ngModelChange)="onSearchChange($event)"
        class="w-full bg-surface-card border border-hairline rounded-full pl-11 pr-4 py-3 text-body-md text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm hover:shadow-md transition-all duration-300"
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
