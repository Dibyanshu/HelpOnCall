import { useState } from 'react';
import { ChevronsLeftRight, FileText, Loader2 } from 'lucide-react';

function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
}

function renderStatusBadge(status) {
  const classes = status === 'approve'
    ? 'bg-emerald-100 text-emerald-800'
    : status === 'reject'
      ? 'bg-rose-100 text-rose-800'
      : 'bg-amber-100 text-amber-800';

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${classes}`}
    >
      {status === 'approve' ? 'Approved' : status === 'reject' ? 'Rejected' : 'New'}
    </span>
  );
}

function renderSpecializations(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return '-';
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return '-';
    }

    return parsed
      .map((item) => (typeof item === 'string' ? item : `${item?.categoryId || '?'}:${item?.serviceId || '?'}`))
      .join(', ');
  } catch {
    return value;
  }
}

export default function EmploymentAdminTable({
  submissions,
  isLoading,
  isUpdatingEmpId,
  isDownloadingEmpId,
  onApprove,
  onReject,
  onDownloadResume,
}) {
  const [isApplicantIdExpanded, setIsApplicantIdExpanded] = useState(false);
  const [statusEditModeByEmpId, setStatusEditModeByEmpId] = useState({});

  const openStatusEditMode = (empId) => {
    setStatusEditModeByEmpId((prev) => ({ ...prev, [empId]: true }));
  };

  const closeStatusEditMode = (empId) => {
    setStatusEditModeByEmpId((prev) => {
      if (!prev[empId]) return prev;
      const next = { ...prev };
      delete next[empId];
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-600 animate-pulse">Syncing Personnel Records...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="admin-table">
        <thead>
          <tr>
            <th
              scope="col"
              className={`px-2 transition-all ${isApplicantIdExpanded ? 'w-[130px]' : 'w-[44px]'}`}
            >
              <button
                type="button"
                onClick={() => setIsApplicantIdExpanded((prev) => !prev)}
                className="inline-flex w-full items-center gap-1 rounded px-1.5 py-1 hover:bg-slate-200/70"
                aria-label={isApplicantIdExpanded ? 'Collapse Applicant ID column' : 'Expand Applicant ID column'}
                title={isApplicantIdExpanded ? 'Collapse Applicant ID column' : 'Expand Applicant ID column'}
              >
                <ChevronsLeftRight className="h-3.5 w-3.5 shrink-0" />
                <span className={`${isApplicantIdExpanded ? 'inline' : 'hidden'} whitespace-nowrap`}>Applicant ID</span>
              </button>
            </th>
            <th scope="col">Name</th>
            <th scope="col">Contacts</th>
            <th scope="col">Specializations</th>
            <th scope="col">Status</th>
            <th scope="col">Submitted At</th>
            <th scope="col">Resume</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.length > 0 ? (
            submissions.map((item) => (
              <tr key={item.empId}>
                <td
                  className={`px-2 text-teal-700 font-mono text-xs font-bold transition-all ${isApplicantIdExpanded ? 'w-[130px]' : 'w-[44px]'}`}
                >
                  {isApplicantIdExpanded ? (
                    <span className="whitespace-nowrap">{item.empId}</span>
                  ) : (
                    <span className="block h-4 w-4 rounded-full bg-slate-200" aria-hidden="true" />
                  )}
                </td>
                <td>
                  <p>{item.fullName}</p>
                  <p>{item.coverLetter || 'No cover letter.'}</p>
                </td>
                <td>
                  <p>{item.emailAddress}</p>
                  <p>{item.phoneNumber}</p>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {renderSpecializations(item.specializations).split(', ').map((spec, sIdx) => (
                      <span key={sIdx}>{spec}</span>
                    ))}
                  </div>
                </td>
                <td>{renderStatusBadge(item.status)}</td>
                <td>{formatDateTime(item.createdAt)}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => onDownloadResume(item.empId)}
                    disabled={isDownloadingEmpId !== ''}
                    className="h-8 w-8 flex items-center justify-center bg-slate-100 border border-slate-300 rounded-md text-slate-400 hover:text-teal-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download Resume"
                    aria-label="Download Resume"
                  >
                    {isDownloadingEmpId === item.empId ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <FileText size={16} />
                    )}
                  </button>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {item.status === 'new' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(item.empId)}
                          disabled={isUpdatingEmpId !== ''}
                          className="px-3 py-1.5 text-xs rounded-md font-bold transition-all btn-activate disabled:opacity-50"
                        >
                          {isUpdatingEmpId === item.empId ? '...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(item.empId)}
                          disabled={isUpdatingEmpId !== ''}
                          className="px-3 py-1.5 text-xs rounded-md font-bold transition-all btn-deactivate disabled:opacity-50"
                        >
                          {isUpdatingEmpId === item.empId ? '...' : 'Reject'}
                        </button>
                      </>
                    ) : statusEditModeByEmpId[item.empId] ? (
                      <>
                        {item.status === 'approve' ? (
                          <button
                            type="button"
                            onClick={() => {
                              onReject(item.empId);
                              closeStatusEditMode(item.empId);
                            }}
                            disabled={isUpdatingEmpId !== ''}
                            className="px-3 py-1.5 text-xs rounded-md font-bold transition-all btn-deactivate disabled:opacity-50"
                          >
                            {isUpdatingEmpId === item.empId ? '...' : 'Reject'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onApprove(item.empId);
                              closeStatusEditMode(item.empId);
                            }}
                            disabled={isUpdatingEmpId !== ''}
                            className="px-3 py-1.5 text-xs rounded-md font-bold transition-all btn-activate disabled:opacity-50"
                          >
                            {isUpdatingEmpId === item.empId ? '...' : 'Approve'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => closeStatusEditMode(item.empId)}
                          disabled={isUpdatingEmpId !== ''}
                          className="px-3 py-1.5 text-xs rounded-md font-bold transition-all btn-secondary disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openStatusEditMode(item.empId)}
                        disabled={isUpdatingEmpId !== ''}
                        className="px-3 py-1.5 text-xs rounded-md font-bold transition-all btn-secondary disabled:opacity-50"
                      >
                        Change Status
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8}>
                No employment submissions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
