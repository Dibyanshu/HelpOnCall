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

  return (
    <AdminSlideInPanel
      isOpen={isOpen}
      onClose={onClose}
      canClose={!isSubmitting}
      title="Edit User"
      eyebrow="Admin Portal"
      ariaLabel="Edit user form panel"
      panelClassName="max-w-md"
    >
      <form onSubmit={onSubmit} className="space-y-4" aria-label="Edit user form">
          <div>
            <label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={onChange}
              minLength={2}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              placeholder="Jane Doe"
            />
            {fieldErrors.name.length > 0 ? (
              <ul className="mt-1 list-disc pl-5 text-xs text-red-700" role="alert">
                {fieldErrors.name.map((message, index) => (
                  <li key={`${message}-${index}`}>{message}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div>
            <label htmlFor="edit-email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="edit-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              placeholder="jane@helponcall.com"
            />
            {fieldErrors.email.length > 0 ? (
              <ul className="mt-1 list-disc pl-5 text-xs text-red-700" role="alert">
                {fieldErrors.email.map((message, index) => (
                  <li key={`${message}-${index}`}>{message}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {canEditRoles ? (
            <div>
              <label htmlFor="edit-role" className="mb-1 block text-sm font-medium text-slate-700">
                Role
              </label>
              <select
                id="edit-role"
                name="role"
                value={formData.role}
                onChange={onChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              >
                {editableRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {fieldErrors.role.length > 0 ? (
                <ul className="mt-1 list-disc pl-5 text-xs text-red-700" role="alert">
                  {fieldErrors.role.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={onChange}
                className="h-4 w-4 rounded border-slate-300 accent-teal-700 text-teal-700 focus:ring-teal-700"
              />
              User is active
            </label>
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
      </form>
    </AdminSlideInPanel>
  );
}
