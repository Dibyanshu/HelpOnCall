import { useState } from 'react';
import FormHelpTooltip from './FormHelpTooltip.jsx';

const MODULE_OPTIONS = ['employee', 'user_registration', 'rfq', 'system'];

const FIELD_HELP = {
  templateKey: {
    title: 'Template Key',
    description: 'Unique key used by the API utility to fetch this template.',
    example: 'user_registration_ack or email_verification_code',
  },
  module: {
    title: 'Module',
    description: 'Module context for this template. Keep it module-agnostic for reuse.',
    example: 'employee, user_registration, rfq, system',
  },
  channel: {
    title: 'Channel',
    description: 'Delivery channel for future extensibility. Keep as email for now.',
    example: 'email',
  },
  subjectTemplate: {
    title: 'Subject Template',
    description: 'Email subject with dynamic placeholders like {{name}}.',
    example: 'HelpOnCall {{moduleLabel}} email verification code',
  },
  textTemplate: {
    title: 'Text Template',
    description: 'Plain-text fallback body. Use placeholders for dynamic values.',
    example: 'Your HelpOnCall verification code is: {{code}}',
  },
  htmlTemplate: {
    title: 'HTML Template',
    description: 'Optional rich HTML body for styled emails.',
    example: '<p>Hi {{name}},</p><p>Your registration has been received.</p>',
  },
  variablesSchema: {
    title: 'Variables Schema',
    description: 'JSON descriptor of required and optional placeholders.',
    example: '{"required":["name"],"optional":["role"]}',
  },
  description: {
    title: 'Description',
    description: 'Short operational note describing where this template is used.',
    example: 'Sent to users after public registration',
  },
  isActive: {
    title: 'Active',
    description: 'If disabled, flows may use fallback defaults depending on API behavior.',
    example: 'Enabled for production-ready templates',
  },
};

function LabelWithHelp({ label, help, htmlFor }) {
  return (
    <div className="mb-1 flex items-center gap-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-600">{label}</label>
      <FormHelpTooltip title={help.title} description={help.description} example={help.example} />
    </div>
  );
}

export default function EmailTemplateForm({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
  fieldErrors,
}) {
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
      {errorMessage ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {!isEdit ? (
        <div>
          <LabelWithHelp label="Template Key *" htmlFor="templateKey" help={FIELD_HELP.templateKey} />
          <input
            id="templateKey"
            type="text"
            name="templateKey"
            value={form.templateKey}
            onChange={handleChange}
            required
            placeholder="e.g. user_registration_ack"
            className="input w-full"
          />
          {fieldErrors?.templateKey ? (
            <p className="mt-1 text-xs text-rose-600">{fieldErrors.templateKey[0]}</p>
          ) : null}
          <p className="mt-1 text-xs text-slate-400">Lowercase letters, numbers, and underscores only.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <LabelWithHelp label="Module *" htmlFor="module" help={FIELD_HELP.module} />
          <select id="module" name="module" value={form.module} onChange={handleChange} className="input w-full">
            {MODULE_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <LabelWithHelp label="Channel" htmlFor="channel" help={FIELD_HELP.channel} />
          <input
            id="channel"
            type="text"
            name="channel"
            value={form.channel}
            onChange={handleChange}
            className="input w-full"
          />
        </div>
      </div>

      <div>
        <LabelWithHelp label="Subject Template *" htmlFor="subjectTemplate" help={FIELD_HELP.subjectTemplate} />
        <input
          id="subjectTemplate"
          type="text"
          name="subjectTemplate"
          value={form.subjectTemplate}
          onChange={handleChange}
          required
          placeholder="e.g. Welcome {{name}}"
          className="input w-full"
        />
        {fieldErrors?.subjectTemplate ? (
          <p className="mt-1 text-xs text-rose-600">{fieldErrors.subjectTemplate[0]}</p>
        ) : null}
      </div>

      <div>
        <LabelWithHelp label="Text Template *" htmlFor="textTemplate" help={FIELD_HELP.textTemplate} />
        <textarea
          id="textTemplate"
          name="textTemplate"
          value={form.textTemplate}
          onChange={handleChange}
          required
          rows={5}
          placeholder="Plain text body. Use {{variableName}} placeholders."
          className="input w-full font-mono text-xs"
        />
        {fieldErrors?.textTemplate ? (
          <p className="mt-1 text-xs text-rose-600">{fieldErrors.textTemplate[0]}</p>
        ) : null}
      </div>

      <div>
        <LabelWithHelp label="HTML Template" htmlFor="htmlTemplate" help={FIELD_HELP.htmlTemplate} />
        <textarea
          id="htmlTemplate"
          name="htmlTemplate"
          value={form.htmlTemplate}
          onChange={handleChange}
          rows={6}
          placeholder="Optional HTML body. Use {{variableName}} placeholders."
          className="input w-full font-mono text-xs"
        />
      </div>

      <div>
        <LabelWithHelp label="Variables Schema (JSON)" htmlFor="variablesSchema" help={FIELD_HELP.variablesSchema} />
        <input
          id="variablesSchema"
          type="text"
          name="variablesSchema"
          value={form.variablesSchema}
          onChange={handleChange}
          placeholder='e.g. {"required":["name"],"optional":["role"]}'
          className="input w-full font-mono text-xs"
        />
        {fieldErrors?.variablesSchema ? (
          <p className="mt-1 text-xs text-rose-600">{fieldErrors.variablesSchema[0]}</p>
        ) : null}
      </div>

      <div>
        <LabelWithHelp label="Description" htmlFor="description" help={FIELD_HELP.description} />
        <input
          id="description"
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Brief description of where this template is used"
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
        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active</label>
        <FormHelpTooltip
          title={FIELD_HELP.isActive.title}
          description={FIELD_HELP.isActive.description}
          example={FIELD_HELP.isActive.example}
        />
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
