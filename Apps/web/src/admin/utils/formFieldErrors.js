export function createInitialFieldErrors(fieldNames) {
  return fieldNames.reduce((acc, fieldName) => {
    acc[fieldName] = [];
    return acc;
  }, {});
}

export function normalizeZodFieldErrors(errorPayload, initialFieldErrors) {
  const nextFieldErrors = { ...initialFieldErrors };
  const fieldErrors = errorPayload?.errors?.fieldErrors;

  if (!fieldErrors || typeof fieldErrors !== 'object') {
    return nextFieldErrors;
  }

  Object.keys(nextFieldErrors).forEach((fieldName) => {
    const value = fieldErrors[fieldName];
    if (Array.isArray(value) && value.length > 0) {
      nextFieldErrors[fieldName] = value;
    }
  });

  return nextFieldErrors;
}

export function hasAnyFieldErrors(fieldErrors) {
  return Object.values(fieldErrors).some((messages) => Array.isArray(messages) && messages.length > 0);
}
