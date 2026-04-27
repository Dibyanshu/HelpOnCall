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

export const validateFullName = (name) => {
  if (!name || !name.trim()) return 'Full name is required';
  if (name.trim().length < 2) return 'Full name must be at least 2 characters';
  if (name.trim().length > 100) return 'Full name must be 100 characters or less';
  if (!/^[a-zA-Z\s'\-.]+$/.test(name.trim())) return 'Full name may only contain letters, spaces, hyphens, and apostrophes';
  return '';
};

export const validateDateOfBirth = (dob) => {
  if (!dob) return 'Date of birth is required';
  const date = new Date(dob);
  if (isNaN(date.getTime())) return 'Please enter a valid date of birth';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date >= today) return 'Date of birth must be in the past';
  const minBirthDate = new Date(today);
  minBirthDate.setFullYear(minBirthDate.getFullYear() - 18);
  if (date > minBirthDate) return 'Staff member must be at least 18 years old';
  return '';
};

export const validateDateOfJoining = (doj) => {
  if (!doj) return 'Date of joining is required';
  const date = new Date(doj);
  if (isNaN(date.getTime())) return 'Please enter a valid date of joining';
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  if (date > oneYearFromNow) return 'Date of joining cannot be more than 1 year in the future';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least 1 uppercase letter (A–Z)';
  if (!/[a-z]/.test(password)) return 'Password must contain at least 1 lowercase letter (a–z)';
  if (!/[0-9]/.test(password)) return 'Password must contain at least 1 number (0–9)';
  if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least 1 special character (! @ # $ % ^ & *)';
  return '';
};

export const validateStaffId = (staffId) => {
  if (!staffId || !staffId.trim()) return 'Staff ID is required';
  if (staffId.trim().length < 3) return 'Staff ID must be at least 3 characters';
  if (!/^[a-zA-Z0-9._-]+$/.test(staffId.trim())) return 'Staff ID may only contain letters, numbers, dots, underscores, and hyphens';
  return '';
};
