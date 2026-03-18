import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';

const DEFAULT_FORM = {
  title: '',
  display_order: 0,
};

// Converts the 1-based display order entered by the user to the 0-based value expected by the backend
function toBackendOrder(order) {
  return order - 1;
}

export default function CategoryForm({ initialData, onClose, onSubmit }) {
  const startingValues = useMemo(
    () => ({
      title: initialData?.title ?? DEFAULT_FORM.title,
      display_order: initialData?.displayOrder ?? initialData?.display_order ?? DEFAULT_FORM.display_order,
    }),
    [initialData],
  );

  const [formData, setFormData] = useState(startingValues);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setErrorMessage('');
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'display_order' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setErrorMessage('Title is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await onSubmit({
        title: formData.title.trim(),
        displayOrder: Number.isFinite(formData.display_order) ? toBackendOrder(formData.display_order) : 0,
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Service category form">
      <div>
        <label htmlFor="category-title" className="mb-1 block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          id="category-title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          placeholder="Category title"
        />
      </div>

      <div>
        <label htmlFor="category-display-order" className="mb-1 block text-sm font-medium text-slate-700">
          Display Order
        </label>
        <input
          id="category-display-order"
          name="display_order"
          type="number"
          value={formData.display_order}
          onChange={handleChange}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
        />
      </div>

      {errorMessage ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Category'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
