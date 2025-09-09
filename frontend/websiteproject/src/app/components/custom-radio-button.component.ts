import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'custom-radio-button',
  standalone: true,
  imports: [CommonModule, MatRippleModule],
  template: `
    <div 
      class="custom-radio-button" 
      [class.checked]="isChecked"
      [class.disabled]="disabled"
      (click)="onClick()"
      (keydown.enter)="onClick()"
      (keydown.space)="onClick()"
      [tabindex]="disabled ? -1 : 0"
      role="radio"
      [attr.aria-checked]="isChecked"
      [attr.aria-disabled]="disabled"
      matRipple
      [matRippleDisabled]="disabled">
      
      <div class="radio-circle">
        <div class="radio-inner" *ngIf="isChecked"></div>
      </div>
      
      <span class="radio-label">
        <ng-content></ng-content>
      </span>
    </div>
  `,
  styles: [`
    .custom-radio-button {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      background: #f5f5f5;
      border-radius: 12px;
      border: 2px solid #e0e0e0;
      transition: all 0.2s ease;
      cursor: pointer;
      user-select: none;
      width: 100%;
      box-sizing: border-box;
      gap: 0.75rem;
      margin: 0;
    }

    .custom-radio-button:hover:not(.disabled) {
      background: #eeeeee;
      border-color: #bdbdbd;
    }

    .custom-radio-button.checked {
      background: #e3f2fd;
      border-color: #0078d4;
    }

    .custom-radio-button.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .custom-radio-button:focus-visible {
      outline: 2px solid var(--mat-primary);
      outline-offset: 2px;
    }

    .radio-circle {
      width: 20px;
      height: 20px;
      border: 2px solid #424242;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: border-color 0.2s ease;
    }

    .custom-radio-button.checked .radio-circle {
      border-color: #0078d4;
    }

    .radio-inner {
      width: 10px;
      height: 10px;
      background: #0078d4;
      border-radius: 50%;
    }

    .radio-label {
      color: rgba(0, 0, 0, 0.87);
      font-size: 1rem;
      flex: 1;
      overflow: hidden;
      word-break: break-word;
      line-height: 1.4;
      font-weight: 400;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomRadioButtonComponent),
      multi: true
    }
  ]
})
export class CustomRadioButtonComponent implements ControlValueAccessor {
  @Input() value: any;
  @Input() name: string = '';
  @Input() disabled: boolean = false;
  
  @Output() selectionChange = new EventEmitter<any>();

  private _groupValue: any;
  private onChange = (value: any) => {};
  private onTouched = () => {};

  get isChecked(): boolean {
    return this._groupValue === this.value;
  }

  onClick(): void {
    if (this.disabled) return;
    
    this._groupValue = this.value;
    this.onChange(this.value);
    this.onTouched();
    this.selectionChange.emit(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this._groupValue = value;
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
