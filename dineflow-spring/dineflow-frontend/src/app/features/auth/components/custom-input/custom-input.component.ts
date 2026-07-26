import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="mb-4">
      <label *ngIf="label" class="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
        {{ label }}
      </label>
      <div class="relative flex items-center">
        <div *ngIf="startIcon" class="absolute left-3 text-slate-400 dark:text-slate-500 z-10 pointer-events-none">
          <lucide-icon [name]="startIcon" class="size-[18px]"></lucide-icon>
        </div>
        <input
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [name]="name"
          [ngModel]="value"
          (ngModelChange)="onModelChange($event)"
          (blur)="onTouched()"
          [ngClass]="{
            'pl-10': startIcon,
            'pl-4': !startIcon,
            'pr-10': endIconTemplate
          }"
          class="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm transition-all duration-300 dark:text-white"
        />
        <div *ngIf="endIconTemplate" class="absolute right-3 z-10">
          <ng-content select="[end-icon]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class CustomInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() startIcon = '';
  @Input() name = '';
  @Input() disabled = false;
  @Input() endIconTemplate = false;

  value: string = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(val: any): void {
    if (val !== undefined) {
      this.value = val;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onModelChange(val: string): void {
    this.value = val;
    this.onChange(val);
  }
}
