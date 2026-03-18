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
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${classes}`}>
      {status}
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
  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading employment submissions...</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-700">Emp ID</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-700">Candidate</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-700">Contact</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-700">Specializations</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-700">Status</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-700">Submitted</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {submissions.length > 0 ? (
            submissions.map((item) => (
              <tr key={item.empId}>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-800">{item.empId}</td>
                <td className="px-3 py-2 text-slate-800">
                  <p className="font-semibold">{item.fullName}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{item.coverLetter || '-'}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                  <p>{item.emailAddress}</p>
                  <p>{item.phoneNumber}</p>
                </td>
                <td className="px-3 py-2 text-slate-700 max-w-[280px]">{renderSpecializations(item.specializations)}</td>
                <td className="whitespace-nowrap px-3 py-2">{renderStatusBadge(item.status)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700">{formatDateTime(item.createdAt)}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDownloadResume(item.empId)}
                      disabled={isDownloadingEmpId !== ''}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDownloadingEmpId === item.empId ? 'Downloading...' : 'Resume'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onApprove(item.empId)}
                      disabled={isUpdatingEmpId !== '' || item.status === 'approve'}
                      className="rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdatingEmpId === item.empId ? 'Saving...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(item.empId)}
                      disabled={isUpdatingEmpId !== '' || item.status === 'reject'}
                      className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdatingEmpId === item.empId ? 'Saving...' : 'Reject'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                No employment submissions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
