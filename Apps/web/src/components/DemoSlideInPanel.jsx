import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEMO_QUERY_KEY = 'demoPanel';
const DEMO_QUERY_VALUE = 'open';

export default function DemoSlideInPanel() {
  const [searchParams, setSearchParams] = useSearchParams();

  const isOpen = useMemo(
    () => searchParams.get(DEMO_QUERY_KEY) === DEMO_QUERY_VALUE,
    [searchParams],
  );

  const openPanel = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(DEMO_QUERY_KEY, DEMO_QUERY_VALUE);
    setSearchParams(nextParams);
  };

  const closePanel = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(DEMO_QUERY_KEY);
    setSearchParams(nextParams);
  };

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        className="fixed bottom-6 right-6 z-[90] inline-flex items-center rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        Open Demo
      </button>

      <div
        className={`fixed inset-0 z-[95] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={closePanel}
        aria-hidden={!isOpen}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Demo panel"
        className={`fixed right-0 top-0 z-[100] h-screen w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Demo Panel</h2>
            <button
              type="button"
              onClick={closePanel}
              className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close demo panel"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6 overflow-y-auto px-6 py-6">
            <p className="text-sm text-gray-600">
              This panel flies in from the right and is controlled by the route query parameter.
              Open state: <span className="font-medium text-teal-700">?demoPanel=open</span>
            </p>

            <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
              <h3 className="text-sm font-semibold text-teal-900">Route-aware behavior</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-teal-800">
                <li>Opening the panel updates the current URL.</li>
                <li>Closing the panel removes only the panel query parameter.</li>
                <li>You can share the URL and open this panel directly.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={closePanel}
              className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
            >
              Close Panel
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
