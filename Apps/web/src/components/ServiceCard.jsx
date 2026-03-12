import { Home, Heart, Accessibility, Check } from 'lucide-react';

const services = [
  {
    title: 'Household Chores',
    icon: Home,
    features: [
      { label: 'Moderate Housekeeping', desc: 'Light home making like Organizing closets & cabinets etc., Preparing & folding laundry, In-house dusting & cleaning, Taking out garbage, Bed making' },
      { label: 'Meal Preparation', desc: 'Kitchen & pantry organization, Ordering groceries & supplies (based upon your need & request), Meal preparation (according to your diet chart & need)' },
      { label: 'Feeding', desc: 'Feeding assistance (as per need), Keeping Kitchen clean' },
    ],
  },
  {
    title: 'Personal Care',
    icon: Heart,
    features: [
      { label: 'Bathing', desc: 'Bed baths, Shower and tub assistance, Stand-by assistance' },
      { label: 'Personal Hygiene', desc: 'Grooming, Dressing, Oral care, Bathroom and incontinence assistance' },
      { label: 'Dressing', desc: 'Adaptive Clothing Usage, Clothing Selection Support, Dressing and Undressing Assistance, Incontinence Management, Fastening and Zippers, Footwear Support' },
    ],
  },
  {
    title: 'Mobility & Companionship',
    icon: Accessibility,
    features: [
      { label: 'Mobility Assistance', desc: 'Follow the delegated mobility protocols (post trauma & surgery), Walking assistance, Wheelchair assistance, Safety supervision, Transferring' },
      { label: 'Companionship', desc: 'Our Companion Services enrich clients lives through genuine social engagement, uplifting activities, and dependable support. From staying active to attending appointments, our compassionate companions help clients remain connected to the world and engaged in the things they love.' },
      { label: 'Walking support', desc: 'Provide walking assistance' },
    ],
  },
];

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ServiceCard() {
  return (
    <section
      id="services"
      className="bg-gray-50 py-16 sm:py-20"
      aria-labelledby="services-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="services-heading"
          className="text-center text-2xl font-bold text-gray-900 sm:text-3xl"
        >
          Our Services
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-gray-600 sm:text-base">
          Comprehensive care services tailored to meet your unique needs and ensure your comfort and well-being.
        </p>

        <div
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          viewport={{ once: true }}
        >
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#004D40]"
              variants={cardVariants}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#004D40]">
                  <service.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg tracking-tight font-semibold text-[#004D40]">
                  {service.title}
                </h3>
              </div>

              <div className="mt-6 space-y-4">
                {service.features.map(({ label, desc }) => (
                  <div
                    key={label}
                    className="flex w-full items-start gap-3 rounded-lg bg-white border border-[#004D40] p-4"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#004D40]">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#004D40]">
                        {label}
                      </span>
                      {desc && (
                        <div className="text-xs text-gray-500">
                          {label === 'Companionship' ? (
                            <p className="leading-relaxed">{desc}</p>
                          ) : desc.includes(',') ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {desc.split(',').map((part, idx) => (
                                <li key={idx}>{part.trim()}</li>
                              ))}
                            </ul>
                          ) : (
                            desc
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
