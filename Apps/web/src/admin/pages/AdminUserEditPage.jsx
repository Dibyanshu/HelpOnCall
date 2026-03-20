import { User, Mail, Shield, ChevronDown } from 'lucide-react';
import AdminSlideInPanel from '../components/AdminSlideInPanel.jsx';

const ROLE_OPTIONS = [
  { value: 'content_publisher', label: 'Content Publisher' },
  { value: 'resume_reviewer', label: 'Resume Reviewer' },
  { value: 'job_poster', label: 'Job Poster' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

export default function AdminUserEditPage({
  isOpen,
  formData,
  fieldErrors,
  errorMessage,
  isSubmitting,
  canEditRoles,
  onChange,
  onSubmit,
  onClose,
}) {
  if (!isOpen) {
    return null;
  }

  const editableRoleOptions = canEditRoles
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((option) => option.value !== 'super_admin');

  const fieldStyles = "block w-full rounded-xl border-0 py-3.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all duration-200 bg-white";

  return (
    <AdminSlideInPanel
      isOpen={isOpen}
      onClose={onClose}
      canClose={!isSubmitting}
      title="Edit Personnel"
      eyebrow="Admin Portal"
      ariaLabel="Edit user form panel"
      panelClassName="max-w-md"
    >
      <form onSubmit={onSubmit} className="space-y-6" aria-label="Edit user form">
          <div className="space-y-1.5">
            <label htmlFor="edit-name" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <User className="h-3.5 w-3.5 text-teal-600/70" />
              Full Legal Name
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={onChange}
              minLength={2}
              className={fieldStyles}
              placeholder="Ex: Jane Doe"
            />
            {fieldErrors.name.length > 0 ? (
              <ul className="mt-1 list-disc pl-5 text-xs text-red-700 font-medium" role="alert">
                {fieldErrors.name.map((message, index) => (
                  <li key={`${message}-${index}`}>{message}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-email" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Mail className="h-3.5 w-3.5 text-teal-600/70" />
              Registered Email
            </label>
            <input
              id="edit-email"
              name="email"
              type="email"
              disabled
              value={formData.email}
              onChange={onChange}
              className={`${fieldStyles} bg-slate-50 cursor-not-allowed opacity-80`}
              placeholder="jane@helponcall.com"
            />
            {fieldErrors.email.length > 0 ? (
              <ul className="mt-1 list-disc pl-5 text-xs text-red-700 font-medium" role="alert">
                {fieldErrors.email.map((message, index) => (
                  <li key={`${message}-${index}`}>{message}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {canEditRoles ? (
            <div className="space-y-1.5">
              <label htmlFor="edit-role" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <Shield className="h-3.5 w-3.5 text-teal-600/70" />
                Access Permissions
              </label>
              <div className="relative">
                <select
                  id="edit-role"
                  name="role"
                  value={formData.role}
                  onChange={onChange}
                  className={`${fieldStyles} appearance-none cursor-pointer pr-10`}
                >
                  {editableRoleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {fieldErrors.role.length > 0 ? (
                <ul className="mt-1 list-disc pl-5 text-xs text-red-700 font-medium" role="alert">
                  {fieldErrors.role.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="pt-2">
            <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer group">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={onChange}
                className="h-5 w-5 rounded-md border-slate-300 accent-teal-700 text-teal-700 focus:ring-teal-700 active:scale-95 transition-transform cursor-pointer"
              />
              <span className="group-hover:text-teal-900 transition-colors">Grant platform access</span>
            </label>
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-bold" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col items-center gap-3 pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full shadow-lg shadow-teal-700/10 active:scale-[0.98] transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Update Records'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary w-full border border-slate-200 bg-white hover:bg-slate-50 transition-all"
            >
              Discard Changes
            </button>
          </div>
      </form>
    </AdminSlideInPanel>
  );
}
