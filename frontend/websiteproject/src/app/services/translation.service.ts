import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'fr';

export interface Translations {
  // Header
  title: string;
  
  // Date and Time Section
  date: string;
  time: string;
  roomNumber: string;
  firstName: string;
  enterRoomNumber: string;
  enterFirstName: string;
  
  // Time options
  times: {
    '06:00': string;
    '06:15': string;
    '06:30': string;
    '06:45': string;
    '07:00': string;
    '07:15': string;
    '07:30': string;
    '07:45': string;
    '08:00': string;
    '08:15': string;
    '08:30': string;
    '08:45': string;
    '09:00': string;
  };
  
  // Eggs Section
  eggs: {
    title: string;
    style: string;
    scrambled: string;
    boiled: string;
    poached: string;
    over: string;
    easy: string;
    medium: string;
    hard: string;
    none: string;
  };
  
  // Pancakes Section
  pancakes: {
    title: string;
    toppings: string;
    asManyAsYouLike: string;
    pancakes: string;
    berries: string;
    bacon: string;
    whippedCream: string;
  };
  
  // Waffles Section
  waffles: {
    title: string;
    options: string;
    waffles: string;
    bacon: string;
    berries: string;
    whippedCream: string;
  };
  
  // Sides Section
  sides: {
    title: string;
    asManyAsYouLike: string;
    bacon: string;
    homeFries: string;
    beans: string;
    toast: string;
    white: string;
    wholeWheat: string;
  };
  
  // Drinks Section
  drinks: {
    title: string;
    asManyAsYouLike: string;
    selectOneEach: string;
    coldDrinks: string;
    hotDrinks: string;
    none: string;
    water: string;
    milk: string;
    juice: string;
    coffee: string;
    tea: string;
    apple: string;
    orange: string;
  };
  
  // Actions
  submitOrder: string;
  submittingOrder: string;
  clearForm: string;
  languageSwitch: string;
  
  // Special Options
  specialOptions: string;
  specialOptionsDescription: string;
  specialOptionsPlaceholder: string;
  
  // Messages
  messages: {
    orderSubmittedSuccessfully: string;
    close: string;
    failedToSubmitOrder: string;
    error: string;
    formCleared: string;
    noGoBack: string;
    yesSubmit: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = signal<Language>('en');
  
  private translations: Record<Language, Translations> = {
    en: {
      // Header
      title: 'Order Breakfast',
      
      // Date and Time Section
      date: 'Date',
      time: 'Time',
      roomNumber: 'Room Number',
      firstName: 'First Name',
      enterRoomNumber: 'Enter room number',
      enterFirstName: 'Enter your first name',
      
      // Time options
      times: {
        '06:00': '6:00 AM',
        '06:15': '6:15 AM',
        '06:30': '6:30 AM',
        '06:45': '6:45 AM',
        '07:00': '7:00 AM',
        '07:15': '7:15 AM',
        '07:30': '7:30 AM',
        '07:45': '7:45 AM',
        '08:00': '8:00 AM',
        '08:15': '8:15 AM',
        '08:30': '8:30 AM',
        '08:45': '8:45 AM',
        '09:00': '9:00 AM'
      },
      
      // Eggs Section
      eggs: {
        title: '2 Eggs',
        style: 'Style',
        scrambled: 'Scrambled',
        boiled: 'Boiled',
        poached: 'Poached',
        over: 'Over...',
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
        none: 'None'
      },
      
      // Pancakes Section
      pancakes: {
        title: 'Pancakes',
        toppings: 'Toppings',
        asManyAsYouLike: '(as many as you\'d like)',
        pancakes: 'Pancakes',
        berries: 'Berries',
        bacon: 'Bacon',
        whippedCream: 'Whipped Cream'
      },
      
      // Waffles Section
      waffles: {
        title: 'Waffles',
        options: 'Options',
        waffles: 'Waffles',
        bacon: 'Bacon',
        berries: 'Berries',
        whippedCream: 'Whipped Cream'
      },
      
      // Sides Section
      sides: {
        title: 'Sides',
        asManyAsYouLike: '(as many as you\'d like)',
        bacon: 'Bacon',
        homeFries: 'Home Fries',
        beans: 'Beans',
        toast: 'Toast',
        white: 'White',
        wholeWheat: 'Whole Wheat'
      },
      
      // Drinks Section
      drinks: {
        title: 'Drinks',
        asManyAsYouLike: '(as many as you\'d like)',
        selectOneEach: 'Select one hot and one cold drink (optional)',
        coldDrinks: 'Cold Drinks',
        hotDrinks: 'Hot Drinks',
        none: 'None',
        water: 'Water',
        milk: 'Milk',
        juice: 'Juice',
        coffee: 'Coffee',
        tea: 'Tea',
        apple: 'Apple',
        orange: 'Orange'
      },
      
      // Actions
      submitOrder: 'Submit Order',
      submittingOrder: 'Submitting...',
      clearForm: 'Clear Form',
      languageSwitch: 'FR',
      
      // Special Options
      specialOptions: 'Special Options',
      specialOptionsDescription: 'Any allergies, dietary restrictions, or special requests',
      specialOptionsPlaceholder: 'Please specify any allergies, dietary restrictions, or special requests...',
      
      // Messages
      messages: {
        orderSubmittedSuccessfully: 'Order submitted successfully!',
        close: 'Close',
        failedToSubmitOrder: 'Failed to submit order',
        error: 'Error',
        formCleared: 'Form cleared successfully',
        noGoBack: 'No, go back',
        yesSubmit: 'Yes, submit order'
      }
    },
    
    fr: {
      // Header
      title: 'Commander le Petit Déjeuner',
      
      // Date and Time Section
      date: 'Date',
      time: 'Heure',
      roomNumber: 'Numéro de Chambre',
      firstName: 'Prénom',
      enterRoomNumber: 'Entrez le numéro de chambre',
      enterFirstName: 'Entrez votre prénom',
      
      // Time options
      times: {
        '06:00': '6h00',
        '06:15': '6h15',
        '06:30': '6h30',
        '06:45': '6h45',
        '07:00': '7h00',
        '07:15': '7h15',
        '07:30': '7h30',
        '07:45': '7h45',
        '08:00': '8h00',
        '08:15': '8h15',
        '08:30': '8h30',
        '08:45': '8h45',
        '09:00': '9h00'
      },
      
      // Eggs Section
      eggs: {
        title: '2 Œufs',
        style: 'Style',
        scrambled: 'Brouillés',
        boiled: 'À la coque',
        poached: 'Pochés',
        over: 'Au plat...',
        easy: 'Coulant',
        medium: 'Moyen',
        hard: 'Bien cuit',
        none: 'Aucun'
      },
      
      // Pancakes Section
      pancakes: {
        title: 'Crêpes',
        toppings: 'Garnitures',
        asManyAsYouLike: '(autant que vous voulez)',
        pancakes: 'Crêpes',
        berries: 'Baies',
        bacon: 'Bacon',
        whippedCream: 'Crème Fouettée'
      },
      
      // Waffles Section
      waffles: {
        title: 'Gaufres',
        options: 'Options',
        waffles: 'Gaufres',
        bacon: 'Bacon',
        berries: 'Baies',
        whippedCream: 'Crème Fouettée'
      },
      
      // Sides Section
      sides: {
        title: 'Accompagnements',
        asManyAsYouLike: '(autant que vous voulez)',
        bacon: 'Bacon',
        homeFries: 'Pommes de Terre Sautées',
        beans: 'Haricots',
        toast: 'Pain Grillé',
        white: 'Blanc',
        wholeWheat: 'Blé Entier'
      },
      
      // Drinks Section
      drinks: {
        title: 'Boissons',
        asManyAsYouLike: '(autant que vous voulez)',
        selectOneEach: 'Sélectionnez une boisson chaude et une froide (optionnel)',
        coldDrinks: 'Boissons Froides',
        hotDrinks: 'Boissons Chaudes',
        none: 'Aucune',
        water: 'Eau',
        milk: 'Lait',
        juice: 'Jus',
        coffee: 'Café',
        tea: 'Thé',
        apple: 'Pomme',
        orange: 'Orange'
      },
      
      // Actions
      submitOrder: 'Soumettre la Commande',
      submittingOrder: 'Soumission...',
      clearForm: 'Effacer',
      languageSwitch: 'EN',
      
      // Special Options
      specialOptions: 'Options Spéciales',
      specialOptionsDescription: 'Allergies, restrictions alimentaires ou demandes spéciales',
      specialOptionsPlaceholder: 'Veuillez spécifier toute allergie, restriction alimentaire ou demande spéciale...',
      
      // Messages
      messages: {
        orderSubmittedSuccessfully: 'Commande soumise avec succès!',
        close: 'Fermer',
        failedToSubmitOrder: 'Échec de la soumission de la commande',
        error: 'Erreur',
        formCleared: 'Formulaire effacé',
        noGoBack: 'Non, revenir',
        yesSubmit: 'Oui, soumettre la commande'
      }
    }
  };
  
  get language() {
    return this.currentLanguage();
  }
  
  get t(): Translations {
    return this.translations[this.currentLanguage()];
  }
  
  // Debug method to check current state
  get debugInfo() {
    return {
      currentLanguage: this.currentLanguage(),
      languageSwitch: this.translations[this.currentLanguage()].languageSwitch,
      title: this.translations[this.currentLanguage()].title
    };
  }
  
  setLanguage(language: Language): void {
    this.currentLanguage.set(language);
    // Store in localStorage for persistence
    localStorage.setItem('preferred-language', language);
  }
  
  toggleLanguage(): void {
    const newLanguage: Language = this.currentLanguage() === 'en' ? 'fr' : 'en';
    this.setLanguage(newLanguage);
  }
  
  initializeLanguage(): void {
    // Check localStorage first
    const stored = localStorage.getItem('preferred-language') as Language;
    if (stored && (stored === 'en' || stored === 'fr')) {
      this.currentLanguage.set(stored);
      return;
    }
    
    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('fr')) {
      this.currentLanguage.set('fr');
    } else {
      this.currentLanguage.set('en');
    }
  }
}
