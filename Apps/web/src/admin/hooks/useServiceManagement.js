import { useCallback, useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function useServiceManagement({ token, onUnauthorized }) {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      onUnauthorized?.();
      return { response, data, unauthorized: true };
    }

    return { response, data, unauthorized: false };
  }, [onUnauthorized, token]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [categoriesResult, servicesResult] = await Promise.all([
        request('/api/v1/admin/service-categories', { method: 'GET' }),
        request('/api/v1/admin/services', { method: 'GET' }),
      ]);

      if (categoriesResult.unauthorized || servicesResult.unauthorized) {
        return;
      }

      if (!categoriesResult.response.ok) {
        throw new Error(categoriesResult.data?.message || 'Failed to load service categories.');
      }

      if (!servicesResult.response.ok) {
        throw new Error(servicesResult.data?.message || 'Failed to load services.');
      }

      setCategories(Array.isArray(categoriesResult.data?.data) ? categoriesResult.data.data : []);
      setServices(Array.isArray(servicesResult.data?.data) ? servicesResult.data.data : []);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load service data.');
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (!token) {
      setCategories([]);
      setServices([]);
      setIsLoading(false);
      return;
    }

    void loadData();
  }, [loadData, token]);

  const categoriesForDropdown = useMemo(
    () => categories.map((category) => ({ id: category.id, title: category.title })),
    [categories],
  );

  const serviceTree = useMemo(() => {
    const servicesByCategory = new Map();

    for (const service of services) {
      const current = servicesByCategory.get(service.categoryId) ?? [];
      current.push(service);
      servicesByCategory.set(service.categoryId, current);
    }

    return categories.map((category) => ({
      ...category,
      services: servicesByCategory.get(category.id) ?? [],
    }));
  }, [categories, services]);

  const runMutation = useCallback(async (mutation) => {
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { response, data, unauthorized } = await mutation();

      if (unauthorized) {
        return { ok: false, unauthorized: true };
      }

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          data,
          message: data?.message || 'Request failed.',
        };
      }

      await loadData();
      setSuccessMessage(data?.message || 'Saved successfully.');
      return { ok: true, data };
    } catch (error) {
      setErrorMessage(error.message || 'Request failed.');
      return { ok: false, message: error.message || 'Request failed.' };
    } finally {
      setIsSaving(false);
    }
  }, [loadData]);

  const createCategory = useCallback(
    (payload) => runMutation(() => request('/api/v1/admin/service-categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })),
    [request, runMutation],
  );

  const updateCategory = useCallback(
    (categoryId, payload) => runMutation(() => request(`/api/v1/admin/service-categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })),
    [request, runMutation],
  );

  const deleteCategory = useCallback(
    (categoryId) => runMutation(() => request(`/api/v1/admin/service-categories/${categoryId}`, {
      method: 'DELETE',
    })),
    [request, runMutation],
  );

  const createService = useCallback(
    (payload) => runMutation(() => request('/api/v1/admin/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    })),
    [request, runMutation],
  );

  const updateService = useCallback(
    (serviceId, payload) => runMutation(() => request(`/api/v1/admin/services/${serviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })),
    [request, runMutation],
  );

  const deleteService = useCallback(
    (serviceId) => runMutation(() => request(`/api/v1/admin/services/${serviceId}`, {
      method: 'DELETE',
    })),
    [request, runMutation],
  );

  return {
    categories,
    services,
    serviceTree,
    categoriesForDropdown,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    setErrorMessage,
    setSuccessMessage,
    refresh: loadData,
    createCategory,
    updateCategory,
    deleteCategory,
    createService,
    updateService,
    deleteService,
  };
}
