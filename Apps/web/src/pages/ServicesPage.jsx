import { Home, ChefHat, Utensils, Bath, Sparkles, Shirt, Accessibility, Users, Footprints } from 'lucide-react';
import serviceHero from '../assets/Service_Hero.png';
import { useServices } from '../appServices/useServices.js';

const ICONS_BY_NAME = {
  Home,
  ChefHat,
  Utensils,
  Bath,
  Sparkles,
  Shirt,
  Accessibility,
  Users,
  Footprints,
};

export default function ServiceCard() {
  const { services } = useServices();

  const normalizedServices = services.map((service) => ({
    ...service,
    features: (service.features ?? []).map((feature) => ({
      ...feature,
      icon: ICONS_BY_NAME[feature.icon] ?? Home,
    })),
  }));

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
          {normalizedServices.map((service) => (
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
                      className="group relative bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300" // 'rounded-md' is verified to be correct
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
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-[#004D40] mb-3">
                        <span className="font-bold text-gray-300">#{feature.displayOrder + 1}</span>
                        <span>{feature.label}</span>
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
