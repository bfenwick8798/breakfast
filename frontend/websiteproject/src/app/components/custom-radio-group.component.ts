import { Component, Input, Output, EventEmitter, forwardRef, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomRadioButtonComponent } from './custom-radio-button.component';

@Component({
  selector: 'custom-radio-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-radio-group" role="radiogroup" [attr.aria-labelledby]="ariaLabelledby">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .custom-radio-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
      box-sizing: border-box;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomRadioGroupComponent),
      multi: true
    }
  ]
})
export class CustomRadioGroupComponent implements ControlValueAccessor, AfterContentInit {
  @Input() name: string = '';
  @Input() ariaLabelledby: string = '';
  
  @Output() selectionChange = new EventEmitter<any>();

  @ContentChildren(CustomRadioButtonComponent) radioButtons!: QueryList<CustomRadioButtonComponent>;

  private _value: any;
  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngAfterContentInit(): void {
    // Subscribe to selection changes from radio buttons
    this.radioButtons.forEach(button => {
      button.selectionChange.subscribe((value: any) => {
        this.value = value;
      });
    });
  }

  get value(): any {
    return this._value;
  }

  set value(newValue: any) {
    if (this._value !== newValue) {
      this._value = newValue;
      this.onChange(newValue);
      this.onTouched();
      this.selectionChange.emit(newValue);
      this.updateRadioButtons();
    }
  }

  private updateRadioButtons(): void {
    if (this.radioButtons) {
      this.radioButtons.forEach(button => {
        button.writeValue(this._value);
      });
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this._value = value;
    this.updateRadioButtons();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.radioButtons) {
      this.radioButtons.forEach(button => {
        button.setDisabledState(isDisabled);
      });
    }
  }
}
