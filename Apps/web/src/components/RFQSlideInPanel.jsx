import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import RFQForm from './forms/RFQForm';

const RFQ_QUERY_KEY = 'rfqPanel';
const RFQ_QUERY_VALUE = 'open';

export default function RFQSlideInPanel() {
  const [searchParams, setSearchParams] = useSearchParams();

  const isOpen = useMemo(
    () => searchParams.get(RFQ_QUERY_KEY) === RFQ_QUERY_VALUE,
    [searchParams],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  const openPanel = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(RFQ_QUERY_KEY, RFQ_QUERY_VALUE);
    setSearchParams(nextParams);
  };

  const closePanel = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(RFQ_QUERY_KEY);
    setSearchParams(nextParams);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[95] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={closePanel}
        aria-hidden={!isOpen}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="RFQ panel"
        className={`fixed right-0 top-0 z-[100] h-screen w-full md:w-[60%] lg:w-[40%] bg-white shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Request For Quote</h2>
            <button
              type="button"
              onClick={closePanel}
              className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close RFQ panel"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6 overflow-y-auto px-6 py-6">
            <RFQForm onCancel={closePanel} />
          </div>
        </div>
      </aside>
    </>
  );
}
