import { useState } from 'react';

const services = {
  nursing: {
    label: 'Nursing Services',
    icon: (
      <svg className="h-8 w-8 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
    items: ['Home care', 'Post-op'],
  },
  hospitality: {
    label: 'Hospitality Services',
    icon: (
      <svg className="h-8 w-8 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5M10.5 21H3m16.5-18.545L21 3m-1.5.545v15.454M3 21V9l9-6 4.5 3" />
      </svg>
    ),
    items: ['Corporate housing', 'Elderly concierge'],
  },
};

export default function ServiceToggle() {
  const [active, setActive] = useState('nursing');

  return (
    <section
      id="services"
      className="bg-gray-50 py-16 sm:py-20"
      aria-labelledby="service-toggle-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="service-toggle-heading"
          className="text-center text-2xl font-bold text-gray-900 sm:text-3xl"
        >
          Service Toggle
        </h2>

        {/* Desktop cards */}
        <div className="mt-10 hidden gap-6 sm:grid sm:grid-cols-2 lg:max-w-3xl lg:mx-auto">
          {Object.entries(services).map(([key, service]) => (
            <button
              key={key}
              type="button"
              className={`flex flex-col items-start rounded-xl border-2 p-6 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                active === key
                  ? 'border-teal-700 bg-white shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setActive(key)}
              aria-pressed={active === key}
            >
              <div className="flex items-center gap-3">
                {service.icon}
                <span className="text-lg font-semibold text-gray-900">{service.label}</span>
              </div>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-gray-600" role="list">
                {service.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Mobile stacked */}
        <div className="mt-8 space-y-4 sm:hidden">
          {Object.entries(services).map(([key, service]) => (
            <button
              key={key}
              type="button"
              className={`flex w-full flex-col items-start rounded-xl border-2 p-5 text-left transition-all ${
                active === key
                  ? 'border-teal-700 bg-white shadow-lg'
                  : 'border-gray-200 bg-white'
              }`}
              onClick={() => setActive(key)}
              aria-pressed={active === key}
            >
              <div className="flex items-center gap-3">
                {service.icon}
                <span className="font-semibold text-gray-900">{service.label}</span>
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600" role="list">
                {service.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
