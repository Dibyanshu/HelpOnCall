import { useState } from 'react';
import { ChevronsLeftRight, Loader2 } from 'lucide-react';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return '-';
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

function renderServices(value) {
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

export default function RfqAdminTable({
  submissions,
  isLoading,
  isUpdatingRfqId,
  onApprove,
  onReject,
}) {
  const [isRfqIdExpanded, setIsRfqIdExpanded] = useState(false);
  const [statusEditModeByRfqId, setStatusEditModeByRfqId] = useState({});

  const openStatusEditMode = (rfqId) => {
    setStatusEditModeByRfqId((prev) => ({ ...prev, [rfqId]: true }));
  };

  const closeStatusEditMode = (rfqId) => {
    setStatusEditModeByRfqId((prev) => {
      if (!prev[rfqId]) return prev;
      const next = { ...prev };
      delete next[rfqId];
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-600 animate-pulse">Loading Quotation Records...</p>
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
              className={`px-2 transition-all ${isRfqIdExpanded ? 'w-[130px]' : 'w-[44px]'}`}
            >
              <button
                type="button"
                onClick={() => setIsRfqIdExpanded((prev) => !prev)}
                className="inline-flex w-full items-center gap-1 rounded px-1.5 py-1 hover:bg-slate-200/70"
                aria-label={isRfqIdExpanded ? 'Collapse RFQ ID column' : 'Expand RFQ ID column'}
                title={isRfqIdExpanded ? 'Collapse RFQ ID column' : 'Expand RFQ ID column'}
              >
                <ChevronsLeftRight className="h-3.5 w-3.5 shrink-0" />
                <span className={`${isRfqIdExpanded ? 'inline' : 'hidden'} whitespace-nowrap`}>RFQ ID</span>
              </button>
            </th>
            <th scope="col">Name</th>
            <th scope="col">Contact</th>
            <th scope="col">Services</th>
            <th scope="col">Address</th>
            <th scope="col">Start Date</th>
            <th scope="col">Status</th>
            <th scope="col">Submitted At</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.length > 0 ? (
            submissions.map((item) => (
              <tr key={item.rfqId}>
                <td
                  className={`px-2 text-teal-700 font-mono text-xs font-bold transition-all ${isRfqIdExpanded ? 'w-[130px]' : 'w-[44px]'}`}
                >
                  {isRfqIdExpanded ? (
                    <span className="whitespace-nowrap">{item.rfqId}</span>
                  ) : (
                    <span className="block h-4 w-4 rounded-full bg-slate-200" aria-hidden="true" />
                  )}
                </td>
                <td>
                  <p>{item.fullName}</p>
                </td>
                <td>
                  <p>{item.email}</p>
                  <p>{item.phone}</p>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {renderServices(item.serviceSelected).split(', ').map((svc) => (
                      <span key={svc}>{svc}</span>
                    ))}
                  </div>
                </td>
                <td>{item.address}</td>
                <td>{formatDate(item.startDate)}</td>
                <td>{renderStatusBadge(item.status)}</td>
                <td>{formatDateTime(item.createdAt)}</td>
                <td>
                  <div className="flex items-center gap-2">
                    {item.status === 'new' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(item.rfqId)}
                          disabled={isUpdatingRfqId !== ''}
                          className="px-3 py-1.5 text-xs rounded-md font-bold transition-all btn-activate disabled:opacity-50"
                        >
                          {isUpdatingRfqId === item.rfqId ? '...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(item.rfqId)}
                          disabled={isUpdatingRfqId !== ''}
                          className="px-3 py-1.5 text-xs rounded-md font-bold transition-all btn-deactivate disabled:opacity-50"
                        >
                          {isUpdatingRfqId === item.rfqId ? '...' : 'Reject'}
                        </button>
                      </>
                    ) : statusEditModeByRfqId[item.rfqId] ? (
                      <>
                        {item.status === 'approve' ? (
                          <button
                            type="button"
                            onClick={() => {
                              onReject(item.rfqId);
                              closeStatusEditMode(item.rfqId);
                            }}
                            disabled={isUpdatingRfqId !== ''}
                            className="px-3 py-1.5 text-xs rounded-md font-bold transition-all btn-deactivate disabled:opacity-50"
                          >
                            {isUpdatingRfqId === item.rfqId ? '...' : 'Reject'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onApprove(item.rfqId);
                              closeStatusEditMode(item.rfqId);
                            }}
                            disabled={isUpdatingRfqId !== ''}
                            className="px-3 py-1.5 text-xs rounded-md font-bold transition-all btn-activate disabled:opacity-50"
                          >
                            {isUpdatingRfqId === item.rfqId ? '...' : 'Approve'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => closeStatusEditMode(item.rfqId)}
                          disabled={isUpdatingRfqId !== ''}
                          className="px-3 py-1.5 text-xs rounded-md font-bold transition-all btn-secondary disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openStatusEditMode(item.rfqId)}
                        disabled={isUpdatingRfqId !== ''}
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
              <td colSpan={9}>
                No quotation requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
