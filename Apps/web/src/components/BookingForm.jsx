import { useState } from 'react';

const serviceTypes = {
  nursing: ['Home Care', 'Post-Op Care', 'Palliative Care', 'Wound Care'],
  hospitality: ['Corporate Housing', 'Elderly Concierge', 'Short-Term Stay', 'Long-Term Stay'],
};

const urgencyOptions = ['Routine', 'Urgent', 'Emergency'];

const locations = [
  'East York',
  'GTA Neighborhoods',
  'Location Brookline',
  'Satay /Bathries',
  'Toronto',
  'North York',
  'Scarborough',
  'Etobicoke',
];

export default function BookingForm() {
  const [tab, setTab] = useState('nursing');
  const [formData, setFormData] = useState({
    serviceType: '',
    urgency: '',
    location: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
  };

  return (
    <section
      id="booking"
      className="bg-white py-16 sm:py-20"
      aria-labelledby="booking-heading"
    >
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <h2
          id="booking-heading"
          className="text-center text-2xl font-bold text-gray-900 sm:text-3xl"
        >
          Booking Form
        </h2>

        {/* Tab toggle */}
        <div className="mt-8 flex rounded-lg border border-gray-200 bg-gray-50 p-1" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'nursing'}
            aria-controls="panel-nursing"
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === 'nursing'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setTab('nursing')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
            </svg>
            Nursing Services
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'hospitality'}
            aria-controls="panel-hospitality"
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === 'hospitality'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setTab('hospitality')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5M10.5 21H3m16.5-18.545L21 3m-1.5.545v15.454M3 21V9l9-6 4.5 3" />
            </svg>
            Hospitality Services
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
          id={`panel-${tab}`}
          role="tabpanel"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Service Type */}
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                Service Type
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-teal-700 focus:ring-1 focus:ring-teal-700 focus:outline-none"
              >
                <option value="">Select</option>
                {serviceTypes[tab].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">
                Urgency
              </label>
              <select
                id="urgency"
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-teal-700 focus:ring-1 focus:ring-teal-700 focus:outline-none"
              >
                <option value="">Select</option>
                {urgencyOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location (GTA Neighborhoods)
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-teal-700 focus:ring-1 focus:ring-teal-700 focus:outline-none"
            >
              <option value="">Select a neighborhood</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-md bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Request A Care Plan
          </button>
        </form>
      </div>
    </section>
  );
}
