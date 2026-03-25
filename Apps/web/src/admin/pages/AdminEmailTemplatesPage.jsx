import { useCallback, useEffect, useState } from 'react';
import { RotateCw, Plus, Mail, ChevronDown, ChevronUp, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { useConfirm } from '../../components/common/ConfirmDialog.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const MODULE_OPTIONS = ['employee', 'user_registration', 'rfq', 'system'];

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function TemplateForm({ initialData = {}, onSubmit, onCancel, isSubmitting, errorMessage, fieldErrors }) {
  const [form, setForm] = useState({
    templateKey: initialData.templateKey || '',
    module: initialData.module || 'system',
    channel: initialData.channel || 'email',
    subjectTemplate: initialData.subjectTemplate || '',
    textTemplate: initialData.textTemplate || '',
    htmlTemplate: initialData.htmlTemplate || '',
    variablesSchema: initialData.variablesSchema || '',
    description: initialData.description || '',
    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
  });

  const isEdit = !!initialData.id;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      {!isEdit && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Template Key *</label>
          <input
            type="text"
            name="templateKey"
            value={form.templateKey}
            onChange={handleChange}
            required
            placeholder="e.g. user_registration_ack"
            className="input w-full"
          />
          {fieldErrors?.templateKey && (
            <p className="text-xs text-rose-600 mt-1">{fieldErrors.templateKey[0]}</p>
          )}
          <p className="text-xs text-slate-400 mt-1">Lowercase letters, numbers, and underscores only.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Module *</label>
          <select name="module" value={form.module} onChange={handleChange} className="input w-full">
            {MODULE_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Channel</label>
          <input
            type="text"
            name="channel"
            value={form.channel}
            onChange={handleChange}
            className="input w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Subject Template *</label>
        <input
          type="text"
          name="subjectTemplate"
          value={form.subjectTemplate}
          onChange={handleChange}
          required
          placeholder="e.g. Welcome {{name}}!"
          className="input w-full"
        />
        {fieldErrors?.subjectTemplate && (
          <p className="text-xs text-rose-600 mt-1">{fieldErrors.subjectTemplate[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Text Template *</label>
        <textarea
          name="textTemplate"
          value={form.textTemplate}
          onChange={handleChange}
          required
          rows={5}
          placeholder="Plain text email body. Use {{variableName}} for placeholders."
          className="input w-full font-mono text-xs"
        />
        {fieldErrors?.textTemplate && (
          <p className="text-xs text-rose-600 mt-1">{fieldErrors.textTemplate[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">HTML Template</label>
        <textarea
          name="htmlTemplate"
          value={form.htmlTemplate}
          onChange={handleChange}
          rows={6}
          placeholder="Optional HTML email body. Use {{variableName}} for placeholders."
          className="input w-full font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Variables Schema (JSON)</label>
        <input
          type="text"
          name="variablesSchema"
          value={form.variablesSchema}
          onChange={handleChange}
          placeholder='e.g. {"required":["name"],"optional":["role"]}'
          className="input w-full font-mono text-xs"
        />
        {fieldErrors?.variablesSchema && (
          <p className="text-xs text-rose-600 mt-1">{fieldErrors.variablesSchema[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Brief description of when this template is used"
          className="input w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-teal-600"
        />
        <label htmlFor="isActive" className="text-sm text-slate-700 font-medium">Active</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary px-5">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary px-5">
          {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Template'}
        </button>
      </div>
    </form>
  );
}

function TestSendPanel({ template, onClose, token }) {
  const toast = useToast();
  const [to, setTo] = useState('');
  const [dataJson, setDataJson] = useState('{}');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();

    let parsedData = {};
    try {
      parsedData = JSON.parse(dataJson);
    } catch {
      toast.error('Data must be valid JSON');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/email-templates/${template.id}/test-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to, data: parsedData }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to send test email.');
      }

      toast.success('Test email sent successfully!');
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to send test email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">Test Send: {template.templateKey}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Recipient Email *</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              placeholder="test@example.com"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Template Variables (JSON)
            </label>
            <textarea
              value={dataJson}
              onChange={(e) => setDataJson(e.target.value)}
              rows={4}
              placeholder='{"name": "John", "code": "123456"}'
              className="input w-full font-mono text-xs"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary px-4">
              Cancel
            </button>
            <button type="submit" disabled={isSending} className="btn-primary px-4 flex items-center gap-2">
              <Send size={14} />
              {isSending ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TemplateRow({ template, onEdit, onToggleActive, onTestSend, isUpdating }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="whitespace-nowrap px-3 py-3 text-slate-800 font-mono text-xs">{template.templateKey}</td>
        <td className="whitespace-nowrap px-3 py-3">
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-slate-100 text-slate-600">
            {template.module}
          </span>
        </td>
        <td className="px-3 py-3 text-slate-600 text-xs max-w-[200px] truncate">{template.description || '-'}</td>
        <td className="whitespace-nowrap px-3 py-3">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${template.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
            {template.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="whitespace-nowrap px-3 py-3 text-slate-500 text-xs">{formatDateTime(template.updatedAt)}</td>
        <td className="whitespace-nowrap px-3 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="btn-secondary px-2 py-1.5 text-xs rounded-md"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              type="button"
              onClick={() => onEdit(template)}
              className="btn-secondary px-3 py-1.5 text-xs rounded-md"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onTestSend(template)}
              className="btn-secondary px-2 py-1.5 text-xs rounded-md"
              title="Test Send"
            >
              <Send size={14} />
            </button>
            <button
              type="button"
              onClick={() => onToggleActive(template)}
              disabled={isUpdating}
              className={`px-3 py-1.5 text-xs rounded-md font-bold transition-all ${template.isActive ? 'btn-deactivate' : 'btn-activate'} disabled:opacity-50`}
            >
              {isUpdating ? '...' : template.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50 border-b border-slate-100">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-slate-500 mb-1 uppercase tracking-wider">Subject Template</p>
                <pre className="bg-white border border-slate-200 rounded p-2 text-slate-700 whitespace-pre-wrap break-all">{template.subjectTemplate}</pre>
              </div>
              <div>
                <p className="font-semibold text-slate-500 mb-1 uppercase tracking-wider">Variables Schema</p>
                <pre className="bg-white border border-slate-200 rounded p-2 text-slate-700 whitespace-pre-wrap break-all">{template.variablesSchema || '-'}</pre>
              </div>
              <div>
                <p className="font-semibold text-slate-500 mb-1 uppercase tracking-wider">Text Template</p>
                <pre className="bg-white border border-slate-200 rounded p-2 text-slate-700 whitespace-pre-wrap">{template.textTemplate}</pre>
              </div>
              {template.htmlTemplate && (
                <div>
                  <p className="font-semibold text-slate-500 mb-1 uppercase tracking-wider">HTML Template</p>
                  <pre className="bg-white border border-slate-200 rounded p-2 text-slate-700 whitespace-pre-wrap text-[10px] overflow-auto max-h-36">{template.htmlTemplate}</pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
      setShowCreateForm(false);
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
    setEditingTemplate(template);
  };

  const closeEdit = () => {
    setEditingTemplate(null);
    setFormError('');
    setFormFieldErrors({});
  };

  const openCreate = () => {
    setFormError('');
    setFormFieldErrors({});
    setShowCreateForm(true);
  };

  const closeCreate = () => {
    setShowCreateForm(false);
    setFormError('');
    setFormFieldErrors({});
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-md border border-slate-200 bg-white p-6 shadow-md sm:p-8"
      >
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
      </motion.div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Create New Template</h3>
              <button onClick={closeCreate} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <TemplateForm
              onSubmit={handleCreate}
              onCancel={closeCreate}
              isSubmitting={isSubmitting}
              errorMessage={formError}
              fieldErrors={formFieldErrors}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Form */}
      <AnimatePresence>
        {editingTemplate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-teal-200 bg-white p-6 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">
                Edit: <span className="font-mono text-teal-700">{editingTemplate.templateKey}</span>
              </h3>
              <button onClick={closeEdit} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <TemplateForm
              initialData={editingTemplate}
              onSubmit={handleEdit}
              onCancel={closeEdit}
              isSubmitting={isSubmitting}
              errorMessage={formError}
              fieldErrors={formFieldErrors}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
                    <TemplateRow
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
    </div>
  );
}
