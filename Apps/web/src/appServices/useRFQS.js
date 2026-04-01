import { useCallback, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function readErrorMessage(errorBody) {
  if (errorBody && typeof errorBody === 'object' && 'message' in errorBody) {
    const message = errorBody.message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return 'Unable to submit your request right now.';
}

function toIsoDateTime(mmddyyyy) {
  if (typeof mmddyyyy !== 'string') {
    throw new Error('Start date is required.');
  }

  const match = mmddyyyy.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    throw new Error('Start date must be in MM/DD/YYYY format.');
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  const isValid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isValid) {
    throw new Error('Start date is invalid.');
  }

  return date.toISOString();
}

function toDurationType(unit) {
  if (unit === 'days') {
    return 'Day';
  }

  if (unit === 'weeks') {
    return 'Week';
  }

  if (unit === 'months') {
    return 'Month';
  }

  return 'Week';
}

function normalizeSelections(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => (
      item &&
      typeof item === 'object' &&
      Number.isInteger(item.categoryId) &&
      Number.isInteger(item.serviceId)
    ))
    .map((item) => ({
      categoryId: item.categoryId,
      serviceId: item.serviceId,
    }));
}

function buildRfqPayload(formData) {
  return {
    email: formData.email.trim(),
    fullName: formData.fullName.trim(),
    phone: formData.phone.trim(),
    address: formData.address.trim(),
    preferredContact: formData.contactPreference,
    serviceSelected: normalizeSelections(formData.serviceCategories),
    startDate: toIsoDateTime(formData.startDate),
    durationVal: Number(formData.durationValue),
    durationType: toDurationType(formData.durationUnit),
    selfCare: formData.careType === 'self',
    recipientName: formData.careType === 'someone_else' ? formData.personName.trim() : formData.fullName.trim(),
    recipientRelation: formData.careType === 'someone_else' ? formData.personRelation.trim() : 'Self',
  };
}

export function useRFQS() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const submitRFQ = useCallback(async (formData) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = buildRfqPayload(formData);

      const response = await fetch(`${API_BASE_URL}/api/v1/rfqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(readErrorMessage(data));
      }

      setSuccessMessage(data?.message || 'Request submitted successfully.');
      return { ok: true, data };
    } catch (error) {
      setErrorMessage(error.message || 'Unable to submit your request right now.');
      return { ok: false, error: error.message || 'Unable to submit your request right now.' };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    isSubmitting,
    errorMessage,
    successMessage,
    setErrorMessage,
    setSuccessMessage,
    submitRFQ,
  };
}