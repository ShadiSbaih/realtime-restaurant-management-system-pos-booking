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
    <div class="mb-md">
      <label *ngIf="label" class="block text-caption-tight text-charcoal mb-xs">
        {{ label }}
      </label>
      <div class="relative flex items-center">
        <div *ngIf="startIcon" class="absolute left-sm text-mute z-10 pointer-events-none flex items-center justify-center">
          <lucide-icon [name]="startIcon" class="size-4"></lucide-icon>
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
            'pl-[36px]': startIcon,
            'pl-sm': !startIcon,
            'pr-[36px]': endIconTemplate
          }"
          class="w-full bg-canvas border border-hairline rounded-md h-[40px] text-body-sm text-ink placeholder:text-mute focus:outline-none focus:border-[#333] transition-colors disabled:opacity-50"
        />
        <div *ngIf="endIconTemplate" class="absolute right-sm z-10 flex items-center justify-center">
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
