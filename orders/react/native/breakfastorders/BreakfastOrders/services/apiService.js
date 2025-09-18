/**
 * API service for breakfast orders
 */
import { CONFIG } from '../config';

/**
 * Load breakfast orders for a specific date
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {Promise<{orders: Array, summary: Object}>} - Orders and summary data
 */
export async function loadBreakfastOrders(date) {
  try {
    console.log('=== API REQUEST DEBUG ===');
    console.log('Requesting orders for date:', date);
    console.log('API URL:', `${CONFIG.API_BASE_URL}/orders?date=${date}`);
    console.log('========================');
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/orders?date=${date}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('=== API RESPONSE DEBUG ===');
    console.log('Response data:', data);
    console.log('Orders count:', data.orders?.length || 0);
    console.log('Date in response:', data.date);
    console.log('=========================');
    
    return {
      orders: data.orders || [],
      summary: data.summary || null
    };
    
  } catch (error) {
    console.error('=== API ERROR DEBUG ===');
    console.error('Error loading orders:', error);
    console.error('Date requested:', date);
    console.error('API URL:', `${CONFIG.API_BASE_URL}/orders?date=${date}`);
    console.error('======================');
    
    throw error;
  }
}

/**
 * Get user-friendly error message for API errors
 * @param {Error} error - The error object
 * @returns {Object} - Error title and message for user display
 */
export function getApiErrorMessage(error) {
  if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.'
    };
  } else {
    return {
      title: 'Error Loading Orders',
      message: `Unable to load breakfast orders: ${error.message}`
    };
  }
}
