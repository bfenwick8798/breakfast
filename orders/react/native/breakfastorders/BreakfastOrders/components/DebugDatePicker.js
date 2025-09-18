/**
 * Custom Date Picker Component with debugging
 */
import React from 'react';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createDateObjectForPicker, convertDatePickerToString } from '../utils/dateUtils';

export default function DebugDatePicker({ 
  visible, 
  selectedDate, 
  onDateChange, 
  onClose 
}) {
  
  const handleDateChange = (event, date) => {
    // Close picker on Android, keep open on iOS
    if (Platform.OS === 'android') {
      // Android behavior: close picker after selection
      if (event.type === 'dismissed') {
        onClose();
        return;
      }
    } else {
      // iOS behavior: keep picker open
      // onClose will be called separately when user taps outside
    }
    
    if (date) {
      console.log('=== DATE PICKER SELECTION DEBUG ===');
      console.log('Event type:', event.type);
      console.log('Platform:', Platform.OS);
      console.log('Raw date from picker:', date);
      console.log('Date toString():', date.toString());
      console.log('Date toDateString():', date.toDateString());
      console.log('==================================');
      
      // Convert picker date to string format
      const dateString = convertDatePickerToString(date);
      onDateChange(dateString);
    }
  };

  if (!visible) {
    return null;
  }

  // Create proper date object for picker initialization
  const pickerDate = createDateObjectForPicker(selectedDate);
  
  console.log('=== DATE PICKER RENDER DEBUG ===');
  console.log('Visible:', visible);
  console.log('Selected date string:', selectedDate);
  console.log('Picker date object:', pickerDate);
  console.log('Platform:', Platform.OS);
  console.log('===============================');

  return (
    <DateTimePicker
      value={pickerDate}
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={handleDateChange}
      maximumDate={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)} // Allow 3 days in future
      minimumDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)} // Allow 30 days back
    />
  );
}
