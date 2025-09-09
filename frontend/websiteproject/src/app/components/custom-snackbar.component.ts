import { Component, inject, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface SnackBarAction {
  text: string;
  action: string;
}

export interface SnackBarData {
  message: string;
  actions: SnackBarAction[];
}

@Component({
  selector: 'app-custom-snackbar',
  template: `
    <div class="custom-snackbar-container">
      <span class="message">{{ data.message }}</span>
      <div class="actions">
        <button 
          *ngFor="let action of data.actions" 
          mat-button 
          (click)="onAction(action.action)"
          class="action-button">
          {{ action.text }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .custom-snackbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    
    .message {
      flex: 1;
      margin-right: 16px;
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
    
    .action-button {
      color: inherit !important;
      min-width: auto !important;
      padding: 0 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      text-transform: uppercase !important;
    }
  `],
  imports: [MatButtonModule, CommonModule]
})
export class CustomSnackbarComponent {
  public selectedAction: string = '';

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackBarData,
    public snackBarRef: MatSnackBarRef<CustomSnackbarComponent>
  ) {}

  onAction(action: string) {
    this.selectedAction = action;
    this.snackBarRef.dismissWithAction();
  }
}
