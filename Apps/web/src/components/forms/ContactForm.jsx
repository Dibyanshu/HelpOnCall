import { useState } from 'react';

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  message: '',
};

export default function ContactForm() {
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Contact form submitted:', formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-lg sm:p-8"
      aria-label="Contact form"
    >
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          required
          aria-label="Full Name"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          aria-label="Email Address"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          aria-label="Phone Number"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          required
          aria-label="Message"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        Send Message
      </button>
    </form>
  );
}
