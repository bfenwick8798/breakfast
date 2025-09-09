import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { CustomRadioGroupComponent } from './components/custom-radio-group.component';
import { CustomRadioButtonComponent } from './components/custom-radio-button.component';
import { CustomCheckboxComponent } from './components/custom-checkbox.component';
import { CustomSnackbarComponent } from './components/custom-snackbar.component';
import { OrderConfirmationDialogComponent } from './components/order-confirmation-dialog.component';
import { TranslationService } from './services/translation.service';
import { environment } from '../environments/environment';
import { Device } from '@capacitor/device';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    FormsModule, 
    CommonModule,
    MatExpansionModule, 
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatNativeDateModule,
    MatRippleModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CustomRadioGroupComponent, 
    CustomRadioButtonComponent, 
    CustomCheckboxComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  protected translationService = inject(TranslationService);
  
  protected title = 'Breakfast Ordering Kiosk';
  protected darkMode = false;
  
  // Platform detection
  protected isAndroid = false;
  protected isKioskMode = false;
  
  // Secret exit mechanism
  private secretKeySequence: string[] = [];
  private readonly exitPin = '1234'; // Change this to your preferred PIN
  private readonly secretSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight']; // Konami code
  
  // URL token parameter
  protected urlToken: string = '';
  
  // Date and time selection
  protected selectedDate: Date | null = null;
  protected selectedTime: string = '';
  protected roomNumber: number | null = null;
  protected firstName: string = '';
  protected availableTimes = [
    { value: '', display: () => this.translationService.t.messages.selectTime },
    { value: '06:00', display: () => this.translationService.t.times['06:00'] },
    { value: '06:30', display: () => this.translationService.t.times['06:30'] },
    { value: '07:00', display: () => this.translationService.t.times['07:00'] },
    { value: '07:30', display: () => this.translationService.t.times['07:30'] },
    { value: '08:00', display: () => this.translationService.t.times['08:00'] },
    { value: '08:30', display: () => this.translationService.t.times['08:30'] },
    { value: '09:00', display: () => this.translationService.t.times['09:00'] },
  ];
  
  // Eggs section
  protected toastSelected = false;
  protected breadType = '';
  protected overSelected = false;
  protected overStyle = '';
  protected eggStyle = '';
  
  // Pancakes toppings
  protected pancakesSelected = false;
  protected berriesPancakesSelected = false;
  protected baconPancakesSelected = false;
  protected whippedCreamPancakesSelected = false;
  
  // Waffles options
  protected wafflesSelected = false;
  protected baconWafflesSelected = false;
  protected berriesWafflesSelected = false;
  protected whippedCreamWafflesSelected = false;
  
  // Sides
  protected baconSidesSelected = false;
  protected friesSidesSelected = false;
  protected beansSidesSelected = false;
  
  // Drinks
  protected selectedHotDrink = '';
  protected selectedColdDrink = '';
  protected juiceType = '';
  
  // Special Options
  protected specialOptions = '';
  
  // Loading state
  protected isSubmittingOrder = false;
  
  // Order state
  protected orderSubmitted = false;
  
  constructor() {
    this.translationService.initializeLanguage();
    this.setDefaultDateTime();
    this.initializeDarkMode();
    this.extractUrlToken();
    this.detectPlatform();
    this.initializeKioskMode();
  }
  
  private async detectPlatform() {
    try {
      const info = await Device.getInfo();
      this.isAndroid = info.platform === 'android';
      this.isKioskMode = this.isAndroid; // Enable kiosk mode for Android
      console.log('Platform detected:', info.platform, 'isAndroid:', this.isAndroid, 'isKioskMode:', this.isKioskMode);
    } catch (error) {
      console.error('Error detecting platform:', error);
      // Fallback detection
      this.isAndroid = /Android/i.test(navigator.userAgent);
      this.isKioskMode = this.isAndroid;
      console.log('Fallback platform detection, isAndroid:', this.isAndroid, 'isKioskMode:', this.isKioskMode);
    }
  }
  
  private initializeKioskMode() {
    if (this.isKioskMode) {
      console.log('Initializing kiosk mode with enhanced exit prevention');
      
      // Disable right-click context menu
      document.addEventListener('contextmenu', (e) => e.preventDefault());
      
      // Add secret exit mechanism
      this.setupSecretExit();
      
      // Disable ALL keyboard shortcuts that could exit or cause issues
      document.addEventListener('keydown', (e) => {
        // Check for secret sequence first
        this.checkSecretSequence(e.key);
        
        // Allow normal typing in form inputs
        const target = e.target as HTMLElement;
        const isFormInput = target && (
          target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.contentEditable === 'true' ||
          target.closest('mat-form-field') !== null ||
          target.hasAttribute('matInput') ||
          target.classList.contains('mat-input-element')
        );
        
        // If it's a form input, only block dangerous shortcuts
        if (isFormInput) {
          // Only block system shortcuts, allow normal typing
          if (e.key === 'F12' || 
              (e.ctrlKey && e.shiftKey && e.key === 'I') ||
              (e.ctrlKey && e.shiftKey && e.key === 'J') ||
              (e.ctrlKey && e.key === 'u') ||
              e.key === 'F5') {
            e.preventDefault();
          }
          return; // Allow all other keys for form inputs
        }
        
        // For non-form elements, block all dangerous shortcuts
        // Developer tools
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.key === 'u')) {
          e.preventDefault();
        }
        
        // Alt+Tab, Alt+F4, Ctrl+Alt+Delete, Windows key combinations
        if (e.altKey && e.key === 'Tab' ||
            e.altKey && e.key === 'F4' ||
            (e.ctrlKey && e.altKey && e.key === 'Delete') ||
            e.key === 'Meta' ||
            e.key === 'cmd') {
          e.preventDefault();
        }
        
        // Refresh shortcuts
        if ((e.ctrlKey && e.key === 'r') ||
            (e.ctrlKey && e.key === 'R') ||
            e.key === 'F5') {
          e.preventDefault();
        }
        
        // Address bar shortcuts
        if ((e.ctrlKey && e.key === 'l') ||
            (e.ctrlKey && e.key === 'k') ||
            e.key === 'F6') {
          e.preventDefault();
        }
      });
      
      // Enable text selection for form inputs only
      const style = document.createElement('style');
      style.textContent = `
        * {
          user-select: none;
          -webkit-user-select: none;
        }
        input, textarea, [contenteditable="true"], .mat-form-field, .mat-input-element {
          user-select: text !important;
          -webkit-user-select: text !important;
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);
      
      // Prevent zoom
      document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
          e.preventDefault();
        }
      }, { passive: false });
      
      // Prevent pinch-to-zoom on touch devices
      document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });
      
      // Auto-return to app if user somehow navigates away
      window.addEventListener('focus', () => {
        console.log('App regained focus');
      });
      
      window.addEventListener('blur', () => {
        console.log('App lost focus - attempting to regain focus');
        setTimeout(() => {
          window.focus();
        }, 100);
      });
      
      // Prevent navigation away from the app
      window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
      });
      
      // Monitor for visibility changes and force focus back
      document.addEventListener('visibilitychbreakfastange', () => {
        if (document.hidden) {
          console.log('App became hidden - attempting to regain visibility');
          setTimeout(() => {
            window.focus();
            // Try to bring the app back to front
            if (document.hidden) {
              window.location.reload();
            }
          }, 500);
        }
      });
    }
  }
  
  private setupSecretExit() {
    // Secret exit functionality has been removed per user request
    console.log('Kiosk mode active - no exit methods available');
  }
  
  private checkSecretSequence(key: string) {
    // Secret sequence checking disabled - no exit methods available
    console.log('Secret sequence checking disabled');
  }
  
  private extractUrlToken() {
    // Use hardcoded token if available in environment (production build)
    if (environment.hardcodedToken) {
      this.urlToken = environment.hardcodedToken;
      console.log('Using hardcoded token from environment');
    } else {
      // Extract from URL parameters (development)
      const urlParams = new URLSearchParams(window.location.search);
      this.urlToken = urlParams.get('t') || '';
      console.log('Extracted URL token:', this.urlToken);
    }
  }
  
  private setDefaultDateTime() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // If it's before 3 AM, set to today at 7 AM, otherwise tomorrow at 7 AM
    let targetDate: Date;
    if (currentHour < 3) {
      // Before 3 AM - set to today at 7 AM
      targetDate = new Date(now);
    } else {
      // After 3 AM - set to tomorrow at 7 AM
      targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + 1);
    }
    
    // Set time to 7:00 AM
    targetDate.setHours(7, 0, 0, 0);
    
    this.selectedDate = targetDate;
    this.selectedTime = '';
  }
  
  incrementRoom() {
    if (this.roomNumber === null) {
      this.roomNumber = 1;
    } else {
      this.roomNumber++;
    }
  }
  
  decrementRoom() {
    if (this.roomNumber !== null && this.roomNumber > 1) {
      this.roomNumber--;
    }
  }
  
  toggleLanguage() {
    this.translationService.toggleLanguage();
  }
  
  clearForm(showMessage: boolean = true) {
    // Reset order submitted state
    this.orderSubmitted = false;
    
    // Reset all form values to their defaults
    this.selectedDate = null;
    this.selectedTime = '';
    this.roomNumber = null;
    this.firstName = '';
    
    // Reset eggs section
    this.eggStyle = '';
    this.overStyle = '';
    
    // Reset pancakes
    this.pancakesSelected = false;
    this.berriesPancakesSelected = false;
    this.baconPancakesSelected = false;
    this.whippedCreamPancakesSelected = false;
    
    // Reset waffles
    this.wafflesSelected = false;
    this.baconWafflesSelected = false;
    this.berriesWafflesSelected = false;
    this.whippedCreamWafflesSelected = false;
    
    // Reset sides
    this.baconSidesSelected = false;
    this.friesSidesSelected = false;
    this.beansSidesSelected = false;
    this.toastSelected = false;
    this.breadType = '';
    
    // Reset drinks
    this.selectedHotDrink = '';
    this.selectedColdDrink = '';
    this.juiceType = '';
    
    // Reset special options
    this.specialOptions = '';
    
    // Reset default date/time
    this.setDefaultDateTime();
    
    // Show confirmation message only if requested
    if (showMessage) {
      this.snackBar.open(this.translationService.t.messages.formCleared, this.translationService.t.messages.close, {
        duration: 3000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }
  
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('dark-mode', this.darkMode.toString());
    this.applyDarkMode();
  }
  
  private initializeDarkMode() {
    const stored = localStorage.getItem('dark-mode');
    if (stored !== null) {
      this.darkMode = stored === 'true';
    } else {
      // Check system preference
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyDarkMode();
  }
  
  private applyDarkMode() {
    const body = document.body;
    if (this.darkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }
  
  submitOrder() {
    // 1. Gather all data from inputs first
    const orderData = {
      // Customer information
      customer: {
        firstName: this.firstName?.trim(),
        roomNumber: this.roomNumber
      },
      
      // Date and time
      scheduling: {
        date: this.selectedDate?.toISOString().split('T')[0], // YYYY-MM-DD format
        time: this.selectedTime
      },
      
      // Eggs
      eggs: {
        style: this.eggStyle,
        overStyle: this.eggStyle === 'over' ? this.overStyle : null
      },
      
      // Pancakes
      pancakes: {
        selected: this.pancakesSelected,
        toppings: {
          berries: this.berriesPancakesSelected,
          bacon: this.baconPancakesSelected,
          whippedCream: this.whippedCreamPancakesSelected
        }
      },
      
      // Waffles
      waffles: {
        selected: this.wafflesSelected,
        options: {
          bacon: this.baconWafflesSelected,
          berries: this.berriesWafflesSelected,
          whippedCream: this.whippedCreamWafflesSelected
        }
      },
      
      // Sides
      sides: {
        bacon: this.baconSidesSelected,
        homeFries: this.friesSidesSelected,
        beans: this.beansSidesSelected,
        toast: {
          selected: this.toastSelected,
          breadType: this.toastSelected ? this.breadType : null
        }
      },
      
      // Drinks
      drinks: {
        water: this.selectedColdDrink === 'water',
        milk: this.selectedColdDrink === 'milk',
        juice: {
          selected: this.selectedColdDrink === 'juice',
          juiceType: this.selectedColdDrink === 'juice' ? this.juiceType : null
        },
        coffee: this.selectedHotDrink === 'coffee',
        tea: this.selectedHotDrink === 'tea'
      },
      
      // Special Options
      specialOptions: this.specialOptions.trim(),
    };

    // 2. Show confirmation dialog
    const dialogRef = this.dialog.open(OrderConfirmationDialogComponent, {
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
      data: orderData,
      disableClose: true,
      backdropClass: 'dark-backdrop',
      panelClass: 'large-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // User confirmed, proceed with actual submission
        this.performOrderSubmission(orderData);
      }
      // If not confirmed, do nothing (user clicked "No, go back")
    });
  }

  private performOrderSubmission(orderData: any) {
    // Set loading state and reset order submitted flag
    this.isSubmittingOrder = true;
    this.orderSubmitted = false;
    
    // Fallback timeout to ensure loading state is cleared
    const timeoutId = setTimeout(() => {
      if (this.isSubmittingOrder) {
        this.isSubmittingOrder = false;
        console.warn('Order submission timeout - clearing loading state');
      }
    }, 30000); // 30 second timeout
    
    // Add required fields for API
    const completeOrderData = {
      ...orderData,
      // URL Parameters (required by Lambda function)
      urlParameters: {
        //set t to the url parameter T

        t: this.urlToken
      },
      
      // Metadata
      orderTimestamp: new Date().toISOString()
    };

    // 2. Convert to JSON (already done above)
    console.log('Order Data:', completeOrderData);
    
    // 3. Send to API using fetch (alternative to HttpClient)
    const apiUrl = 'https://ze45rhoh2jwerlop276gzudmti0onfii.lambda-url.ca-central-1.on.aws';
    
    // Use native fetch to avoid Angular HttpClient headers
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(completeOrderData),
      mode: 'cors',
      credentials: 'omit'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      // Success - clear loading state and timeout
      clearTimeout(timeoutId);
      this.isSubmittingOrder = false;
      this.orderSubmitted = true; // Mark order as submitted
      console.log('Order submitted successfully:', data);
      
      // Show success message with Edit action first
      this.showSuccessSnackbarWithActions();
    })
    .catch(error => {
      // Error - clear loading state and timeout
      clearTimeout(timeoutId);
      this.isSubmittingOrder = false;
      console.error('Order submission failed:', error);
      
      let errorMessage = this.translationService.t.messages.failedToSubmitOrder;
      
      if (error.message.includes('403')) {
        errorMessage = 'Access forbidden (403). The request may be blocked by CORS or authentication policies.';
      } else if (error.message.includes('502')) {
        errorMessage = 'Server error (502). The Lambda function may have an issue. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.snackBar.open(`${this.translationService.t.messages.error}: ${errorMessage}`, this.translationService.t.messages.close, {
        duration: 10000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    });
  }
  
  // Method to handle clicks on locked fields
  onLockedFieldClick(event: Event) {
    if (this.orderSubmitted) {
      event.preventDefault();
      event.stopPropagation();
      this.showSubmitToEditTooltip(event.target as HTMLElement);
    }
  }
  
  // Method to show tooltip for locked fields
  private showSubmitToEditTooltip(element: HTMLElement) {
    // Remove any existing tooltips
    const existingTooltip = document.querySelector('.submit-to-edit-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'submit-to-edit-tooltip';
    tooltip.textContent = 'Submit form to edit';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = '#323232';
    tooltip.style.color = 'white';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '1000';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    tooltip.style.pointerEvents = 'none';
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
    tooltip.style.top = `${rect.top - 35}px`;
    tooltip.style.transform = 'translateX(-50%)';
    
    // Add to document
    document.body.appendChild(tooltip);
    
    // Remove after 2 seconds
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }, 2000);
  }
  
  // Method to show success snackbar with action buttons
  private showSuccessSnackbarWithActions() {
    const snackBarRef = this.snackBar.openFromComponent(CustomSnackbarComponent, {
      data: {
        message: this.translationService.t.messages.orderSubmittedSuccessfully,
        actions: [
          { text: 'EDIT', action: 'edit' },
          { text: 'NEXT ORDER', action: 'clear' }
        ]
      },
      duration: 0,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });

    snackBarRef.onAction().subscribe(() => {
      const action = snackBarRef.instance.selectedAction;
      if (action === 'clear') {
        this.clearForm(false);
      }
      // If action === 'edit', just dismiss (do nothing)
    });
  }

  // Remove the showClearSnackbar method as we don't need it anymore
}
