import { useCallback, useEffect, useState } from 'react';
import { RotateCw, Plus, Mail } from 'lucide-react';
import { useAdminAuth } from '../../auth/AdminAuthContext.jsx';
import { useToast } from '../../../components/common/Toast.jsx';
import { useConfirm } from '../../../components/common/ConfirmDialog.jsx';
import AdminSlideInPanel from '../../components/AdminSlideInPanel.jsx';
import EmailTemplateForm from './EmailTemplateForm.jsx';
import EmailTemplateRow from './EmailTemplateRow.jsx';
import TestSendPanel from './TestSendPanel.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [panelMode, setPanelMode] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [testSendTemplate, setTestSendTemplate] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formFieldErrors, setFormFieldErrors] = useState({});

  const toast = useToast();
  const confirm = useConfirm();
  const { token, signOut } = useAdminAuth();

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/email-templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        signOut();
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load templates.');
      }

      setTemplates(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load templates.');
    } finally {
      setIsLoading(false);
    }
  }, [token, signOut, toast]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const handleCreate = async (form) => {
    setIsSubmitting(true);
    setFormError('');
    setFormFieldErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/email-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        signOut();
        return;
      }

      if (!response.ok) {
        if (data?.errors?.fieldErrors) {
          setFormFieldErrors(data.errors.fieldErrors);
        }
        throw new Error(data?.message || 'Failed to create template.');
      }

      toast.success('Email template created successfully.');
      setPanelMode(null);
      void loadTemplates();
    } catch (error) {
      setFormError(error.message || 'Failed to create template.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (form) => {
    if (!editingTemplate) return;

    setIsSubmitting(true);
    setFormError('');
    setFormFieldErrors({});

    const { templateKey: _key, ...updateFields } = form;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/email-templates/${editingTemplate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateFields),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        signOut();
        return;
      }

      if (!response.ok) {
        if (data?.errors?.fieldErrors) {
          setFormFieldErrors(data.errors.fieldErrors);
        }
        throw new Error(data?.message || 'Failed to update template.');
      }

      toast.success('Email template updated successfully.');
      setPanelMode(null);
      setEditingTemplate(null);
      void loadTemplates();
    } catch (error) {
      setFormError(error.message || 'Failed to update template.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (template) => {
    if (template.isActive) {
      const confirmed = await confirm({
        title: 'Deactivate Template?',
        message: `Are you sure you want to deactivate "${template.templateKey}"? Emails using this template will fall back to defaults.`,
        confirmText: 'Deactivate',
        cancelText: 'Cancel',
        type: 'deactivate',
      });

      if (!confirmed) return;
    }

    setUpdatingId(template.id);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/email-templates/${template.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !template.isActive }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update template.');
      }

      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, ...data.data } : t))
      );
      toast.success(data?.message || 'Template updated successfully.');
    } catch (error) {
      toast.error(error.message || 'Failed to update template.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openEdit = (template) => {
    setFormError('');
    setFormFieldErrors({});
    setPanelMode('edit');
    setEditingTemplate(template);
  };

  const closePanel = () => {
    if (isSubmitting) {
      return;
    }

    setPanelMode(null);
    setEditingTemplate(null);
    setFormError('');
    setFormFieldErrors({});
  };

  const openCreate = () => {
    setFormError('');
    setFormFieldErrors({});
    setEditingTemplate(null);
    setPanelMode('create');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-md sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-teal-50 flex items-center justify-center text-teal-700">
              <Mail size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Email Templates</h2>
              <p className="text-sm text-slate-500">Manage dynamic email templates used across the platform.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={loadTemplates}
              disabled={isLoading}
              className="btn-secondary gap-2 px-6 transition-all"
            >
              <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="btn-primary gap-2 px-6 transition-all flex items-center"
            >
              <Plus size={16} />
              New Template
            </button>
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md sm:p-6 overflow-hidden">
        {isLoading ? (
          <p className="text-sm text-slate-600 animate-pulse">Loading email templates...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Template Key</th>
                  <th className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Module</th>
                  <th className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Description</th>
                  <th className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Status</th>
                  <th className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Updated At</th>
                  <th className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {templates.length > 0 ? (
                  templates.map((template) => (
                    <EmailTemplateRow
                      key={template.id}
                      template={template}
                      onEdit={openEdit}
                      onToggleActive={handleToggleActive}
                      onTestSend={setTestSendTemplate}
                      isUpdating={updatingId === template.id}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-slate-500 italic">
                      No email templates found. Create one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Test Send Modal */}
      {testSendTemplate && (
        <TestSendPanel
          template={testSendTemplate}
          onClose={() => setTestSendTemplate(null)}
          token={token}
        />
      )}

      <AdminSlideInPanel
        isOpen={panelMode === 'create' || panelMode === 'edit'}
        onClose={closePanel}
        canClose={!isSubmitting}
        title={panelMode === 'edit' ? `Edit: ${editingTemplate?.templateKey || 'Template'}` : 'Create Email Template'}
        ariaLabel={panelMode === 'edit' ? 'Edit email template panel' : 'Create email template panel'}
      >
        <EmailTemplateForm
          key={panelMode === 'edit' ? `edit-${editingTemplate?.id || 'none'}` : 'create-template'}
          initialData={panelMode === 'edit' ? editingTemplate || {} : {}}
          onSubmit={panelMode === 'edit' ? handleEdit : handleCreate}
          onCancel={closePanel}
          isSubmitting={isSubmitting}
          errorMessage={formError}
          fieldErrors={formFieldErrors}
        />
      </AdminSlideInPanel>
    </div>
  );
}
