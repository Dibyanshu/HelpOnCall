import { useCallback, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function parseErrorMessage(data, fallbackMessage) {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = data.message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return fallbackMessage;
}

export function useRFQAdmin({ token, onUnauthorized }) {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingRfqId, setIsUpdatingRfqId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (response.status === 401) {
      onUnauthorized?.();
      return { response, unauthorized: true, data: {} };
    }

    return { response, unauthorized: false };
  }, [onUnauthorized, token]);

  const fetchSubmissions = useCallback(async ({ search = '', status = 'all' } = {}) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const query = new URLSearchParams();

      if (search.trim()) {
        query.set('search', search.trim());
      }

      if (status !== 'all') {
        query.set('status', status);
      }

      const queryString = query.toString();
      const path = `/api/v1/admin/rfqs${queryString ? `?${queryString}` : ''}`;
      const { response, unauthorized } = await request(path, { method: 'GET' });

      if (unauthorized) {
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(parseErrorMessage(data, 'Failed to load quotation requests.'));
      }

      setSubmissions(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load quotation requests.');
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  const updateStatus = useCallback(async (rfqId, status) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsUpdatingRfqId(rfqId);

    try {
      const { response, unauthorized } = await request(`/api/v1/admin/rfqs/${rfqId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (unauthorized) {
        return false;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(parseErrorMessage(data, `Failed to update quotation status.`));
      }

      const updatedRfq = data?.rfq;

      if (updatedRfq?.rfqId) {
        setSubmissions((prev) => prev.map((item) => (
          item.rfqId === updatedRfq.rfqId
            ? { ...item, ...updatedRfq }
            : item
        )));
      }

      setSuccessMessage(data?.message || 'Status updated successfully.');
      return true;
    } catch (error) {
      setErrorMessage(error.message || `Failed to update quotation status.`);
      return false;
    } finally {
      setIsUpdatingRfqId('');
    }
  }, [request]);

  const approveSubmission = useCallback((rfqId) => updateStatus(rfqId, 'approve'), [updateStatus]);
  const rejectSubmission = useCallback((rfqId) => updateStatus(rfqId, 'reject'), [updateStatus]);

  return {
    submissions,
    isLoading,
    isUpdatingRfqId,
    errorMessage,
    successMessage,
    setErrorMessage,
    setSuccessMessage,
    fetchSubmissions,
    approveSubmission,
    rejectSubmission,
  };
}
