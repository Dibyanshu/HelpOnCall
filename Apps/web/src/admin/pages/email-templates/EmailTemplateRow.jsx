import { useState } from 'react';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

export default function EmailTemplateRow({ template, onEdit, onToggleActive, onTestSend, isUpdating }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="transition-colors hover:bg-slate-50">
        <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-slate-800">{template.templateKey}</td>
        <td className="whitespace-nowrap px-3 py-3">
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            {template.module}
          </span>
        </td>
        <td className="max-w-[200px] truncate px-3 py-3 text-xs text-slate-600">{template.description || '-'}</td>
        <td className="whitespace-nowrap px-3 py-3">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${template.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
            {template.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">{formatDateTime(template.updatedAt)}</td>
        <td className="whitespace-nowrap px-3 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="btn-secondary rounded-md px-2 py-1.5 text-xs"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              type="button"
              onClick={() => onEdit(template)}
              className="btn-secondary rounded-md px-3 py-1.5 text-xs"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onTestSend(template)}
              className="btn-secondary rounded-md px-2 py-1.5 text-xs"
              title="Test Send"
            >
              <Send size={14} />
            </button>
            <button
              type="button"
              onClick={() => onToggleActive(template)}
              disabled={isUpdating}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${template.isActive ? 'btn-deactivate' : 'btn-activate'} disabled:opacity-50`}
            >
              {isUpdating ? '...' : template.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </td>
      </tr>

      {expanded ? (
        <tr className="border-b border-slate-100 bg-slate-50">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
              <div>
                <p className="mb-1 font-semibold uppercase tracking-wider text-slate-500">Subject Template</p>
                <pre className="whitespace-pre-wrap break-all rounded border border-slate-200 bg-white p-2 text-slate-700">{template.subjectTemplate}</pre>
              </div>
              <div>
                <p className="mb-1 font-semibold uppercase tracking-wider text-slate-500">Variables Schema</p>
                <pre className="whitespace-pre-wrap break-all rounded border border-slate-200 bg-white p-2 text-slate-700">{template.variablesSchema || '-'}</pre>
              </div>
              <div>
                <p className="mb-1 font-semibold uppercase tracking-wider text-slate-500">Text Template</p>
                <pre className="whitespace-pre-wrap rounded border border-slate-200 bg-white p-2 text-slate-700">{template.textTemplate}</pre>
              </div>
              {template.htmlTemplate ? (
                <div>
                  <p className="mb-1 font-semibold uppercase tracking-wider text-slate-500">HTML Template</p>
                  <pre className="max-h-36 overflow-auto whitespace-pre-wrap rounded border border-slate-200 bg-white p-2 text-[10px] text-slate-700">{template.htmlTemplate}</pre>
                </div>
              ) : null}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
