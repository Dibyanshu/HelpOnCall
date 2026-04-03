import { useMemo, useState } from 'react';
import { ChevronDown, Save } from 'lucide-react';
import IconSelect, { availableIcons } from '../../../components/common/IconSelect.jsx';

const DEFAULT_FORM = {
  category_id: '',
  label: '',
  description: '',
  image_url: '',
  icon_name: '',
  display_order: 0,
};

// Converts the 1-based display order entered by the user to the 0-based value expected by the backend
function toBackendOrder(order) {
  return order - 1;
}

export default function ServiceForm({ initialData, categories, onSubmit }) {
  const startingValues = useMemo(
    () => ({
      category_id: initialData?.categoryId ?? initialData?.category_id ?? categories?.[0]?.id ?? DEFAULT_FORM.category_id,
      label: initialData?.label ?? DEFAULT_FORM.label,
      description: initialData?.desc ?? initialData?.description ?? DEFAULT_FORM.description,
      image_url: initialData?.image ?? initialData?.image_url ?? DEFAULT_FORM.image_url,
      icon_name: initialData?.icon ?? initialData?.icon_name ?? DEFAULT_FORM.icon_name,
      display_order: initialData?.displayOrder ?? initialData?.display_order ?? DEFAULT_FORM.display_order,
    }),
    [categories, initialData],
  );

  const [formData, setFormData] = useState(startingValues);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setErrorMessage('');

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'category_id' || name === 'display_order' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.label.trim()) {
      setErrorMessage('Label is required.');
      return;
    }

    if (!formData.category_id) {
      setErrorMessage('Please select a category.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await onSubmit({
        categoryId: Number(formData.category_id),
        label: formData.label.trim(),
        desc: formData.description.trim(),
        image: formData.image_url.trim(),
        icon: formData.icon_name.trim(),
        displayOrder: Number.isFinite(formData.display_order) ? toBackendOrder(formData.display_order) : 0,
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Service form">
      <div>
        <label htmlFor="service-category-id" className="mb-1 block text-sm font-medium text-slate-700">
          Select Service Category
        </label>
        <div className="relative h-[38px] overflow-hidden rounded-md border border-gray-200 bg-white focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/10 transition-all duration-200">
          <select
            id="service-category-id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="h-full w-full bg-transparent border-0 py-0 pl-3 pr-9 text-sm text-gray-700 appearance-none cursor-pointer focus:ring-0 outline-none"
          >
            {(categories || []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div>
        <label htmlFor="service-label" className="mb-1 block text-sm font-medium text-slate-700">
          Name of the service
        </label>
        <input
          id="service-label"
          name="label"
          type="text"
          value={formData.label}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          placeholder="Service label"
        />
      </div>

      <div>
        <label htmlFor="service-icon-name" className="mb-1 block text-sm font-medium text-slate-700">
          Relevant Icon
        </label>
        <IconSelect
          value={formData.icon_name}
          onChange={(val) => handleChange({ target: { name: 'icon_name', value: val } })}
        />
      </div>

      <div>
        <label htmlFor="service-description" className="mb-1 block text-sm font-medium text-slate-700">
          Service Description
        </label>
        <textarea
          id="service-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          placeholder="Service description"
        />
      </div>

      <div>
        <label htmlFor="service-image-url" className="mb-1 block text-sm font-medium text-slate-700">
          Image URL (Image should in 2:1 ratio in landscape mode)
        </label>
        <input
          id="service-image-url"
          name="image_url"
          type="text"
          value={formData.image_url}
          onChange={handleChange}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          placeholder="https://..."
        />
      </div>

      <div className='hidden'>
        <label htmlFor="service-display-order" className="mb-1 block text-sm font-medium text-slate-700">
          Display Order
        </label>
        <input
          id="service-display-order"
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary gap-2 px-6 transition-all"
      >
        <Save className="h-4 w-4" />
        {isSubmitting ? 'Saving...' : 'Save Service'}
      </button>
    </form>
  );
}
