import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { useToast } from '../../../components/common/Toast.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export default function TestSendPanel({ template, onClose, token }) {
  const toast = useToast();
  const [to, setTo] = useState('');
  const [dataJson, setDataJson] = useState('{}');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();

    let parsedData = {};
    try {
      parsedData = JSON.parse(dataJson);
    } catch {
      toast.error('Data must be valid JSON');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/email-templates/${template.id}/test-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to, data: parsedData }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to send test email.');
      }

      toast.success('Test email sent successfully!');
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to send test email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Test Send: {template.templateKey}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Recipient Email *</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              placeholder="test@example.com"
              className="input w-full"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Template Variables (JSON)</label>
            <textarea
              value={dataJson}
              onChange={(e) => setDataJson(e.target.value)}
              rows={4}
              placeholder='{"name":"John","code":"123456"}'
              className="input w-full font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary px-4">
              Cancel
            </button>
            <button type="submit" disabled={isSending} className="btn-primary flex items-center gap-2 px-4">
              <Send size={14} />
              {isSending ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
