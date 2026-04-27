import RFQForm from '../components/forms/RFQSForm';
import { useNavigate } from 'react-router-dom';

export default function RequestForQuote() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col font-sans">
      {/* Main Workspace — page-level scroll, no card scroll */}
      <main className="flex-1 p-4 sm:p-5 lg:p-6">
        <div className="w-full max-w-full mx-auto">
            <div className="rounded-md border border-gray-200 bg-white shadow-lg p-5 sm:p-7 lg:p-8">
            <RFQForm onCancel={() => navigate('/')} />
          </div>
        </div>
      </main>
    </div>
  );
}
