import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../services/translation.service';

export interface OrderData {
  customer: {
    firstName: string;
    roomNumber: number | null;
  };
  scheduling: {
    date: string;
    time: string;
  };
  eggs: {
    style: string;
    overStyle: string | null;
  };
  pancakes: {
    selected: boolean;
    toppings: {
      berries: boolean;
      bacon: boolean;
      whippedCream: boolean;
    };
  };
  waffles: {
    selected: boolean;
    options: {
      bacon: boolean;
      berries: boolean;
      whippedCream: boolean;
    };
  };
  sides: {
    bacon: boolean;
    homeFries: boolean;
    beans: boolean;
    toast: {
      selected: boolean;
      breadType: string | null;
    };
  };
  drinks: {
    water: boolean;
    milk: boolean;
    juice: {
      selected: boolean;
      juiceType: string | null;
    };
    coffee: boolean;
    tea: boolean;
  };
  specialOptions: string;
}

@Component({
  selector: 'app-order-confirmation-dialog',
  template: `
    <div class="confirmation-dialog">
      <h2 mat-dialog-title>Is this correct?</h2>
      
      <mat-dialog-content class="order-summary">
        <!-- Customer Info -->
        <div class="section">
          <h3>Customer Information</h3>
          <p><strong>{{ translationService.t.firstName }}:</strong> {{ data.customer.firstName }}</p>
          <p><strong>{{ translationService.t.roomNumber }}:</strong> {{ data.customer.roomNumber }}</p>
        </div>

        <!-- Date & Time -->
        <div class="section">
          <h3>Delivery Time</h3>
          <p><strong>{{ translationService.t.date }}:</strong> {{ formatDate(data.scheduling.date) }}</p>
          <p><strong>{{ translationService.t.time }}:</strong> {{ data.scheduling.time }}</p>
        </div>

        <!-- Food Items -->
        <div class="section" *ngIf="hasSelectedItems()">
          <h3>Order Items</h3>
          
          <!-- Eggs -->
          <div *ngIf="data.eggs.style" class="item">
            <strong>{{ translationService.t.eggs.title }}:</strong> 
            {{ getEggDescription() }}
          </div>

          <!-- Pancakes -->
          <div *ngIf="data.pancakes.selected" class="item">
            <strong>{{ translationService.t.pancakes.title }}</strong>
            <span *ngIf="getPancakeToppings()"> with {{ getPancakeToppings() }}</span>
          </div>

          <!-- Waffles -->
          <div *ngIf="data.waffles.selected" class="item">
            <strong>{{ translationService.t.waffles.title }}</strong>
            <span *ngIf="getWaffleToppings()"> with {{ getWaffleToppings() }}</span>
          </div>

          <!-- Sides -->
          <div *ngIf="getSides()" class="item">
            <strong>{{ translationService.t.sides.title }}:</strong> {{ getSides() }}
          </div>

          <!-- Drinks -->
          <div *ngIf="getDrinks()" class="item">
            <strong>{{ translationService.t.drinks.title }}:</strong> {{ getDrinks() }}
          </div>

          <!-- Special Options -->
          <div *ngIf="data.specialOptions.trim()" class="item">
            <strong>{{ translationService.t.specialOptions }}:</strong> {{ data.specialOptions }}
          </div>
        </div>

        <div class="section" *ngIf="!hasSelectedItems()">
          <p class="no-items">No food items selected</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-raised-button (click)="onCancel()">
          {{ translationService.t.messages.noGoBack }}
        </button>
        <button mat-raised-button color="primary" (click)="onConfirm()">
          {{ translationService.t.messages.yesSubmit }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      min-width: 320px;
      max-width: 500px;
      width: 95vw;
    }

    @media (min-width: 768px) {
      .confirmation-dialog {
        width: 600px;
        max-width: 600px;
      }
    }

    .order-summary {
      max-height: 60vh;
      overflow-y: auto;
    }

    .section {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .section:last-child {
      border-bottom: none;
    }

    .section h3 {
      margin: 0 0 12px 0;
      color: var(--md-sys-color-primary);
      font-size: 16px;
      font-weight: 500;
    }

    .section p, .item {
      margin: 8px 0;
      line-height: 1.4;
    }

    .no-items {
      font-style: italic;
      color: #666;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
      gap: 0;
      display: flex;
      width: 100%;
    }

    mat-dialog-actions button {
      flex: 1;
      margin: 0;
      border-radius: 0;
      height: 48px;
    }

    mat-dialog-actions button:first-child {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      border-right: 1px solid #e0e0e0;
    }

    mat-dialog-actions button:last-child {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  `],
  imports: [MatButtonModule, MatDialogModule, CommonModule]
})
export class OrderConfirmationDialogComponent {
  protected translationService = inject(TranslationService);

  constructor(
    public dialogRef: MatDialogRef<OrderConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  hasSelectedItems(): boolean {
    return !!(
      this.data.eggs.style ||
      this.data.pancakes.selected ||
      this.data.waffles.selected ||
      this.data.sides.bacon ||
      this.data.sides.homeFries ||
      this.data.sides.beans ||
      this.data.sides.toast.selected ||
      this.data.drinks.water ||
      this.data.drinks.milk ||
      this.data.drinks.juice.selected ||
      this.data.drinks.coffee ||
      this.data.drinks.tea
    );
  }

  getEggDescription(): string {
    const style = this.data.eggs.style;
    if (style === 'over' && this.data.eggs.overStyle) {
      const styleText = this.getEggStyleText(style);
      const overText = this.getEggStyleText(this.data.eggs.overStyle);
      return `${styleText} ${overText}`;
    }
    return this.getEggStyleText(style);
  }

  private getEggStyleText(style: string): string {
    const eggStyles: { [key: string]: string } = {
      'scrambled': this.translationService.t.eggs.scrambled,
      'boiled': this.translationService.t.eggs.boiled,
      'poached': this.translationService.t.eggs.poached,
      'over': this.translationService.t.eggs.over,
      'easy': this.translationService.t.eggs.easy,
      'medium': this.translationService.t.eggs.medium,
      'hard': this.translationService.t.eggs.hard
    };
    return eggStyles[style] || style;
  }

  getPancakeToppings(): string {
    const toppings = [];
    if (this.data.pancakes.toppings.berries) toppings.push(this.translationService.t.pancakes.berries);
    if (this.data.pancakes.toppings.bacon) toppings.push(this.translationService.t.pancakes.bacon);
    if (this.data.pancakes.toppings.whippedCream) toppings.push(this.translationService.t.pancakes.whippedCream);
    return toppings.join(', ');
  }

  getWaffleToppings(): string {
    const toppings = [];
    if (this.data.waffles.options.berries) toppings.push(this.translationService.t.waffles.berries);
    if (this.data.waffles.options.bacon) toppings.push(this.translationService.t.waffles.bacon);
    if (this.data.waffles.options.whippedCream) toppings.push(this.translationService.t.waffles.whippedCream);
    return toppings.join(', ');
  }

  getSides(): string {
    const sides = [];
    if (this.data.sides.bacon) sides.push(this.translationService.t.sides.bacon);
    if (this.data.sides.homeFries) sides.push(this.translationService.t.sides.homeFries);
    if (this.data.sides.beans) sides.push(this.translationService.t.sides.beans);
    if (this.data.sides.toast.selected) {
      const breadType = this.data.sides.toast.breadType;
      let breadText = this.translationService.t.sides.toast;
      if (breadType === 'white') {
        breadText = `${this.translationService.t.sides.white} ${breadText}`;
      } else if (breadType === 'wheat') {
        breadText = `${this.translationService.t.sides.wholeWheat} ${breadText}`;
      }
      sides.push(breadText);
    }
    return sides.join(', ');
  }

  getDrinks(): string {
    const drinks = [];
    if (this.data.drinks.water) drinks.push(this.translationService.t.drinks.water);
    if (this.data.drinks.milk) drinks.push(this.translationService.t.drinks.milk);
    if (this.data.drinks.juice.selected) {
      const juiceType = this.data.drinks.juice.juiceType;
      let juiceText = this.translationService.t.drinks.juice;
      if (juiceType === 'apple') {
        juiceText = `${this.translationService.t.drinks.apple} ${juiceText}`;
      } else if (juiceType === 'orange') {
        juiceText = `${this.translationService.t.drinks.orange} ${juiceText}`;
      }
      drinks.push(juiceText);
    }
    if (this.data.drinks.coffee) drinks.push(this.translationService.t.drinks.coffee);
    if (this.data.drinks.tea) drinks.push(this.translationService.t.drinks.tea);
    return drinks.join(', ');
  }
}
