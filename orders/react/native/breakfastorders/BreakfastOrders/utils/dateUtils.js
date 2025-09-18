/**
 * Date utility functions to handle timezone issues
 */

/**
 * Get current date in YYYY-MM-DD format using local timezone
 */
export function getCurrentDate() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
}

/**
 * Convert date picker date object to API-safe string format
 * @param {Date} date - Date object from date picker
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export function convertDatePickerToString(date) {
  // Use toLocaleDateString('en-CA') for YYYY-MM-DD format in local timezone
  const localeDateString = date.toLocaleDateString('en-CA');
  
  console.log('=== DATE CONVERSION DEBUG ===');
  console.log('Input date object:', date);
  console.log('date.toString():', date.toString());
  console.log('date.toDateString():', date.toDateString());
  console.log('date.toLocaleDateString():', date.toLocaleDateString());
  console.log('date.toLocaleDateString("en-CA"):', localeDateString);
  console.log('date.toISOString():', date.toISOString());
  console.log('=============================');
  
  return localeDateString;
}

/**
 * Format date string for display (button text)
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} - Human readable date string
 */
export function formatDateForDisplay(dateString) {
  try {
    console.log('=== DISPLAY FORMAT DEBUG ===');
    console.log('Input date string:', dateString);
    
    // Parse the date string in local timezone to avoid UTC conversion
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    console.log('Parsed components:', { year, month, day });
    console.log('Created date object:', date);
    console.log('date.toDateString():', date.toDateString());
    console.log('============================');
    
    // Use toDateString() which shows the correct date
    return date.toDateString(); // e.g., "Wed Aug 06 2025"
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
}

/**
 * Create Date object from YYYY-MM-DD string for date picker value
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} - Date object in local timezone
 */
export function createDateObjectForPicker(dateString) {
  try {
    console.log('=== PICKER DATE OBJECT DEBUG ===');
    console.log('Input date string:', dateString);
    
    // Parse the date string in local timezone to avoid UTC conversion
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    console.log('Parsed components:', { year, month, day });
    console.log('Created date object:', date);
    console.log('================================');
    
    return date;
  } catch (error) {
    console.error('Date object creation error:', error);
    return new Date(); // fallback to current date
  }
}
