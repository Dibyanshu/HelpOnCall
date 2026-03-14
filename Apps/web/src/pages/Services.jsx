import { Home, ChefHat, Utensils, Bath, Sparkles, Shirt, Accessibility, Users, Footprints } from 'lucide-react';
import serviceHero from '../assets/Service_Hero.png';

const services = [
  {
    title: 'Household Chores',
    features: [
      {
        label: 'Moderate Housekeeping',
        desc: 'Light home making like Organizing closets & cabinets etc., Preparing & folding laundry, In-house dusting & cleaning, Taking out garbage, Bed making',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        icon: Home
      },
      {
        label: 'Meal Preparation',
        desc: 'Kitchen & pantry organization, Ordering groceries & supplies (based upon your need & request), Meal preparation (according to your diet chart & need)',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        icon: ChefHat
      },
      {
        label: 'Feeding',
        desc: 'Feeding assistance (as per need), Keeping Kitchen clean',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        icon: Utensils
      },
    ],
  },
  {
    title: 'Personal Care',
    features: [
      {
        label: 'Bathing',
        desc: 'Bed baths, Shower and tub assistance, Stand-by assistance',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        icon: Bath
      },
      {
        label: 'Personal Hygiene',
        desc: 'Grooming, Dressing, Oral care, Bathroom and incontinence assistance',
        image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        icon: Sparkles
      },
      {
        label: 'Dressing',
        desc: 'Adaptive Clothing Usage, Clothing Selection Support, Dressing and Undressing Assistance, Incontinence Management, Fastening and Zippers, Footwear Support',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        icon: Shirt
      },
    ],
  },
  {
    title: 'Mobility & Companionship',
    features: [
      {
        label: 'Mobility Assistance',
        desc: 'Follow the delegated mobility protocols (post trauma & surgery), Walking assistance, Wheelchair assistance, Safety supervision, Transferring',
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        icon: Accessibility
      },
      {
        label: 'Companionship',
        desc: 'Our Companion Services enrich clients lives through genuine social engagement, uplifting activities, and dependable support. From staying active to attending appointments, our compassionate companions help clients remain connected to the world and engaged in the things they love.',
        image: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        icon: Users
      },
      {
        label: 'Walking support',
        desc: 'Provide walking assistance',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        icon: Footprints
      },
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
    <div className="bg-gray-50">
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <img
          src={serviceHero}
          alt="Healthcare professional supporting a senior at home"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-teal-900/75" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-100">Our Services</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
           Providing specialized, respectful personal care in the comfort of home
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-teal-100 sm:text-lg">
            Dedicated to enhancing your quality of life, our trained caregivers provide respectful assistance with daily personal needs.
          </p>
        </div>
      </section>

      <section
        id="services"
        className="py-16 sm:py-20"
        aria-labelledby="services-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {services.map((service) => (
            <div key={service.title} className="mb-16 last:mb-0">
              {/* Service Title as Heading with Bottom Border */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {service.title}
                </h2>
              </div>

              {/* Features as Individual Cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {service.features.map((feature, index) => (
                  <div
                    key={feature.label}
                    className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image at Top */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={feature.image}
                        alt={`${service.title} - ${feature.label}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Overlay for better text readability if needed */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Feature Content */}
                    <div className="p-6">
                      {/* Feature Label */}
                      <h3 className="text-lg font-semibold text-[#004D40] mb-3">
                        {feature.label}
                      </h3>

                      {/* Feature Description */}
                      <div className="text-sm text-gray-600 leading-relaxed">
                        {feature.label === 'Companionship' ? (
                          <p>{feature.desc}</p>
                        ) : feature.desc.includes(',') ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {feature.desc.split(',').map((part, idx) => (
                              <li key={idx}>{part.trim()}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{feature.desc}</p>
                        )}
                      </div>
                    </div>

                    {/* Icon at Bottom Right Corner of Card */}
                    <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                      <feature.icon className="h-12 w-12 text-[#004D40]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
