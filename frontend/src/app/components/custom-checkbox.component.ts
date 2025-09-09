import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'custom-checkbox',
  standalone: true,
  imports: [CommonModule, MatRippleModule],
  template: `
    <div 
      class="custom-checkbox" 
      [class.checked]="isChecked"
      [class.disabled]="disabled"
      (click)="onClick()"
      (keydown.enter)="onClick()"
      (keydown.space)="onClick()"
      [tabindex]="disabled ? -1 : 0"
      role="checkbox"
      [attr.aria-checked]="isChecked"
      [attr.aria-disabled]="disabled"
      [attr.id]="id"
      matRipple
      [matRippleDisabled]="disabled">
      
      <div class="checkbox-box">
        <svg *ngIf="isChecked" class="checkmark" viewBox="0 0 24 24" width="12" height="12">
          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
      
      <span class="checkbox-label">
        <ng-content></ng-content>
      </span>
    </div>
  `,
  styles: [`
    .custom-checkbox {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      min-height: 48px;
    }

    .custom-checkbox:hover:not(.disabled) {
      background: #eeeeee;
      border-color: #bdbdbd;
      transform: translateY(-1px);
      box-shadow: 0 3px 6px rgba(0, 120, 212, 0.15);
    }

    .custom-checkbox.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .custom-checkbox:focus-visible {
      outline: 2px solid #0078d4;
      outline-offset: 2px;
    }

    .checkbox-box {
      width: 20px;
      height: 20px;
      border: 2px solid #424242;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      background: white;
    }

    .custom-checkbox.checked .checkbox-box {
      background: #0078d4;
      border-color: #0078d4;
      transform: scale(1.05);
    }

    .checkmark {
      color: white;
      transform: scale(0);
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .custom-checkbox.checked .checkmark {
      transform: scale(1);
    }

    .checkbox-label {
      color: rgba(0, 0, 0, 0.87);
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.4;
      flex: 1;
    }

    .custom-checkbox.checked .checkbox-label {
      color: #0078d4;
      font-weight: 600;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomCheckboxComponent),
      multi: true
    }
  ]
})
export class CustomCheckboxComponent implements ControlValueAccessor {
  @Input() id: string = '';
  @Input() disabled: boolean = false;
  
  @Output() change = new EventEmitter<boolean>();

  private _checked: boolean = false;
  private onChange = (value: boolean) => {};
  private onTouched = () => {};

  get isChecked(): boolean {
    return this._checked;
  }

  onClick(): void {
    if (this.disabled) return;
    
    this._checked = !this._checked;
    this.onChange(this._checked);
    this.onTouched();
    this.change.emit(this._checked);
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this._checked = !!value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
