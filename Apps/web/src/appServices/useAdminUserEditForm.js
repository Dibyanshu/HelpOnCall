import { useCallback, useState } from 'react';
import {
  createInitialFieldErrors,
  hasAnyFieldErrors,
  normalizeZodFieldErrors,
} from '../admin/utils/formFieldErrors.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const initialEditForm = {
  name: '',
  email: '',
  role: 'content_publisher',
  isActive: true,
};

const initialEditFieldErrors = createInitialFieldErrors(['name', 'email', 'role']);

export function useAdminUserEditForm({
  token,
  user,
  navigate,
  signOut,
  users,
  setUsers,
  setStatusMessage,
  setErrorMessage,
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState(initialEditForm);
  const [editFieldErrors, setEditFieldErrors] = useState(initialEditFieldErrors);
  const [editErrorMessage, setEditErrorMessage] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const canEditUsers = user?.role === 'super_admin' || user?.role === 'admin';
  const canEditRoles = user?.role === 'super_admin';

  const closeEditPanel = useCallback(() => {
    if (isSubmittingEdit) {
      return;
    }

    setIsEditOpen(false);
    setEditingUserId(null);
    setEditFormData(initialEditForm);
    setEditFieldErrors(initialEditFieldErrors);
    setEditErrorMessage('');
  }, [isSubmittingEdit]);

  const openEditPanel = useCallback((targetUser) => {
    if (typeof setStatusMessage === 'function') {
      setStatusMessage('');
    }
    if (typeof setErrorMessage === 'function') {
      setErrorMessage('');
    }
    setEditErrorMessage('');
    setEditFieldErrors(initialEditFieldErrors);
    setEditingUserId(targetUser.id);
    setEditFormData({
      name: targetUser.name || '',
      email: targetUser.email || '',
      role: targetUser.role || 'content_publisher',
      isActive: Boolean(targetUser.isActive),
    });
    setIsEditOpen(true);
  }, [setErrorMessage, setStatusMessage]);

  const handleEditFieldChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;

    if (name in initialEditFieldErrors) {
      setEditFieldErrors((prev) => ({ ...prev, [name]: [] }));
    }

    setEditFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleEditSubmit = useCallback(async (event) => {
    event.preventDefault();

    if (!canEditUsers || !editingUserId) {
      return;
    }

    const targetUser = users.find((item) => item.id === editingUserId);

    if (!targetUser) {
      setEditErrorMessage('Selected user could not be found. Please refresh and try again.');
      return;
    }

    const payload = {};
    const nextName = editFormData.name.trim();
    const nextEmail = editFormData.email.trim();

    if (nextName !== targetUser.name) {
      payload.name = nextName;
    }

    if (nextEmail !== targetUser.email) {
      payload.email = nextEmail;
    }

    if (canEditRoles && editFormData.role !== targetUser.role) {
      payload.role = editFormData.role;
    }

    if (editFormData.isActive !== targetUser.isActive) {
      payload.isActive = editFormData.isActive;
    }

    setEditErrorMessage('');
    setEditFieldErrors(initialEditFieldErrors);

    if (Object.keys(payload).length === 0) {
      setEditErrorMessage('Make at least one change before saving.');
      return;
    }

    setIsSubmittingEdit(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${editingUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        signOut();
        navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/users' } } });
        return;
      }

      if (!response.ok) {
        let nextFieldErrors = { ...initialEditFieldErrors };

        if (response.status === 400) {
          nextFieldErrors = normalizeZodFieldErrors(data, initialEditFieldErrors);
        }

        if (response.status === 409) {
          nextFieldErrors = {
            ...nextFieldErrors,
            email: [data?.message || 'User with this email already exists.'],
          };
        }

        const hasInlineErrors = hasAnyFieldErrors(nextFieldErrors);
        setEditFieldErrors(nextFieldErrors);

        if (hasInlineErrors) {
          return;
        }

        throw new Error(data?.message || 'Failed to update user.');
      }

      const updatedUser = data?.user;

      if (updatedUser?.id) {
        setUsers((prev) => prev.map((item) => (item.id === updatedUser.id ? { ...item, ...updatedUser } : item)));
      }

      if (typeof setStatusMessage === 'function') {
        setStatusMessage(data?.message || 'User updated successfully.');
      }
      closeEditPanel();
    } catch (error) {
      setEditErrorMessage(error.message || 'Failed to update user.');
    } finally {
      setIsSubmittingEdit(false);
    }
  }, [
    canEditRoles,
    canEditUsers,
    closeEditPanel,
    editFormData.email,
    editFormData.isActive,
    editFormData.name,
    editFormData.role,
    editingUserId,
    navigate,
    setStatusMessage,
    setUsers,
    signOut,
    token,
    users,
  ]);

  return {
    isEditOpen,
    editFormData,
    editFieldErrors,
    editErrorMessage,
    isSubmittingEdit,
    canEditUsers,
    canEditRoles,
    openEditPanel,
    closeEditPanel,
    handleEditFieldChange,
    handleEditSubmit,
  };
}
