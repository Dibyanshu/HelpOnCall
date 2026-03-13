import { Home, ChefHat, Utensils, Bath, Sparkles, Shirt, Accessibility, Users, Footprints } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    title: 'Moderate Housekeeping',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  },
  {
    title: "Meal preparation",
    icon: ChefHat,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  },
  {
    title: "Feeding",
    icon: Utensils,
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  },
  {
    title: 'Bathing',
    icon: Bath,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  },
  {
    title: 'Personal Hygiene',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  },
  {
    title: 'Dressing',
    icon: Shirt,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  },
  {
    title: 'Mobility Assistance',
    icon: Accessibility,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  },
  {
    title: 'Companionship',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1551892370-0b43cb8c7e2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  },
  {
    title: 'Walking Support',
    icon: Footprints,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  },
];

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const imageVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export default function ServiceCard() {
  return (
    <section
      id="services"
      className="bg-white py-16 sm:py-20"
      aria-labelledby="services-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 2-Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left Column - Service Cards */}
          <div>
            <h2
              id="services-heading"
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8"
            >
              What are you looking for?
            </h2>

            {/* Service Grid */}
            <div
              className="grid grid-cols-3 gap-4 sm:gap-6"
              variants={container}
              initial="hidden"
              viewport={{ once: true }}
            >
              {services.map((service) => (
                <Link
                  key={service.title}
                  to={`/services`}
                  className="group flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:scale-105"
                  variants={cardVariants}
                >
                  {/* Icon Background */}
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-[#004D40] transition-colors duration-300 mb-3 sm:mb-4">
                    <service.icon className="h-8 w-8 sm:h-10 sm:w-10 text-[#004D40] group-hover:text-white transition-colors duration-300" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {service.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column - Service Images */}
          <div
            className="grid grid-cols-2 gap-2 sm:gap-3"
            variants={imageVariants}
            initial="hidden"
            viewport={{ once: true }}
          > 

            {/* Top right images */}
            <div className="overflow-hidden rounded-lg shadow-md">
              <img
                src={services[1]?.image}
                alt="Service showcase"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="overflow-hidden rounded-lg shadow-md">
              <img
                src={services[2]?.image}
                alt="Service showcase"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="overflow-hidden rounded-lg shadow-md">
              <img
                src={services[3]?.image}
                alt="Service showcase"
                className="w-fullobject-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="overflow-hidden rounded-lg shadow-md">
              <img
                src={services[8]?.image}
                alt="Service showcase"
                className="w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="overflow-hidden rounded-lg shadow-md">
              <img
                src={services[5]?.image}
                alt="Service showcase"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="overflow-hidden rounded-lg shadow-md">
              <img
                src={services[6]?.image}
                alt="Service showcase"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
