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
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50/50">
          <tr>
            <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Applicant ID</th>
            <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Candidate Information</th>
            <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Contacts</th>
            <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Specializations</th>
            <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Status</th>
            <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Submitted At</th>
            <th scope="col" className="px-3 py-3 text-left font-bold text-teal-900 uppercase tracking-tighter">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {submissions.length > 0 ? (
            submissions.map((item) => (
              <tr key={item.empId} className="hover:bg-slate-50 transition-colors">
                <td className="whitespace-nowrap px-3 py-4 text-teal-700 font-mono text-xs font-bold">{item.empId}</td>
                <td className="px-3 py-4">
                  <p className="text-slate-800 font-medium">{item.fullName}</p>
                  <p className="text-[10px] text-slate-500 italic max-w-xs truncate">{item.coverLetter || 'No cover letter.'}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <p className="text-slate-800 text-xs">{item.emailAddress}</p>
                  <p className="text-[10px] text-slate-500">{item.phoneNumber}</p>
                </td>
                <td className="px-3 py-4 text-slate-700 max-w-[200px]">
                  <div className="flex flex-wrap gap-1">
                    {renderSpecializations(item.specializations).split(', ').map((spec, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-600 uppercase">
                        {spec}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4">{renderStatusBadge(item.status)}</td>
                <td className="whitespace-nowrap px-3 py-4 text-slate-500 text-xs italic">{formatDateTime(item.createdAt)}</td>
                <td className="whitespace-nowrap px-3 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDownloadResume(item.empId)}
                      disabled={isDownloadingEmpId !== ''}
                      className="btn-secondary px-3 py-1.5 text-xs rounded-md hover:bg-slate-100"
                    >
                      {isDownloadingEmpId === item.empId ? '...' : 'Resume'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onApprove(item.empId)}
                      disabled={isUpdatingEmpId !== '' || item.status === 'approve'}
                      className={`px-3 py-1.5 text-xs rounded-md font-bold transition-all ${item.status === 'approve'
                        ? 'opacity-30 cursor-not-allowed'
                        : 'btn-activate'
                        } disabled:opacity-50`}
                    >
                      {isUpdatingEmpId === item.empId ? '...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(item.empId)}
                      disabled={isUpdatingEmpId !== '' || item.status === 'reject'}
                      className={`px-3 py-1.5 text-xs rounded-md font-bold transition-all ${item.status === 'reject'
                        ? 'opacity-30 cursor-not-allowed'
                        : 'btn-deactivate'
                        } disabled:opacity-50`}
                    >
                      {isUpdatingEmpId === item.empId ? '...' : 'Reject'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-3 py-10 text-center text-slate-500 italic">
                No employment submissions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
