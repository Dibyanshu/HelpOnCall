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

function parseFileNameFromDisposition(disposition, fallbackName) {
  if (typeof disposition !== 'string' || disposition.length === 0) {
    return fallbackName;
  }

  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallbackName;
}

export function useEmploymentAdmin({ token, onUnauthorized }) {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingEmpId, setIsUpdatingEmpId] = useState('');
  const [isDownloadingEmpId, setIsDownloadingEmpId] = useState('');
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
      const path = `/api/v1/admin/employment${queryString ? `?${queryString}` : ''}`;
      const { response, unauthorized } = await request(path, { method: 'GET' });

      if (unauthorized) {
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(parseErrorMessage(data, 'Failed to load employment submissions.'));
      }

      setSubmissions(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load employment submissions.');
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  const updateStatus = useCallback(async (empId, action) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsUpdatingEmpId(empId);

    try {
      const { response, unauthorized } = await request(`/api/v1/admin/employment/${empId}/${action}`, {
        method: 'POST',
      });

      if (unauthorized) {
        return false;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(parseErrorMessage(data, `Failed to ${action} submission.`));
      }

      const updatedSubmission = data?.submission;

      if (updatedSubmission?.empId) {
        setSubmissions((prev) => prev.map((item) => (
          item.empId === updatedSubmission.empId
            ? { ...item, ...updatedSubmission }
            : item
        )));
      }

      setSuccessMessage(data?.message || 'Status updated successfully.');
      return true;
    } catch (error) {
      setErrorMessage(error.message || `Failed to ${action} submission.`);
      return false;
    } finally {
      setIsUpdatingEmpId('');
    }
  }, [request]);

  const approveSubmission = useCallback((empId) => updateStatus(empId, 'approve'), [updateStatus]);
  const rejectSubmission = useCallback((empId) => updateStatus(empId, 'reject'), [updateStatus]);

  const downloadResume = useCallback(async (empId) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsDownloadingEmpId(empId);

    try {
      const { response, unauthorized } = await request(`/api/v1/admin/employment/${empId}/resume`, {
        method: 'GET',
      });

      if (unauthorized) {
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(parseErrorMessage(data, 'Failed to download resume.'));
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition');
      const fileName = parseFileNameFromDisposition(disposition, `employment-${empId}-resume`);

      const fileUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = fileUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(fileUrl);

      setSuccessMessage('Resume downloaded successfully.');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to download resume.');
    } finally {
      setIsDownloadingEmpId('');
    }
  }, [request]);

  return {
    submissions,
    isLoading,
    isUpdatingEmpId,
    isDownloadingEmpId,
    errorMessage,
    successMessage,
    setErrorMessage,
    setSuccessMessage,
    fetchSubmissions,
    approveSubmission,
    rejectSubmission,
    downloadResume,
  };
}
