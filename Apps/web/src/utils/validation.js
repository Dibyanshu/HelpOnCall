export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

export const validatePhone = (phone) => {
  // Matches standard 10-digit North American phone numbers (e.g., (555) 555-5555, 555-555-5555, 5555555555)
  const phoneRegex = /^\+?1?\s*\(?([2-9][0-9]{2})\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/;
  if (!phone) return 'Phone number is required';
  if (!phoneRegex.test(phone)) return 'Please enter a valid 10-digit phone number';
  return '';
};

export const validateTorontoPostalCode = (postalCode) => {
  // Canada postal code format: A1A 1A1. Toronto specific starts with 'M'
  const torontoPostalRegex = /^M\d[A-Z]\s?\d[A-Z]\d$/i;
  const standardPostalRegex = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;
  
  if (!postalCode) return 'Postal code is required';
  
  // First check if it's a valid Canadian postal code
  if (!standardPostalRegex.test(postalCode)) {
    return 'Please enter a valid Canadian postal code (e.g., M5E 1A1)';
  }
  
  // Then check if it's in Toronto (starts with M)
  if (!torontoPostalRegex.test(postalCode)) {
    return 'HelpOnCall currently focuses on the Toronto region (Postal codes starting with "M")';
  }
  
  return '';
};

export const validateRequired = (value, fieldName = 'This field') => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} is required`;
  }
  return '';
};
