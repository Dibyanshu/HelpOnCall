import { useState, useEffect } from 'react';
import { Quote, Star } from 'lucide-react';
import t1 from '../assets/testimonials/t1.jpg';
import t2 from '../assets/testimonials/t2.jpg';
import t3 from '../assets/testimonials/t3.jpg';
import t4 from '../assets/testimonials/t4.jpg';
import t5 from '../assets/testimonials/t5.jpg';
import t6 from '../assets/testimonials/t6.jpg';

// Maximum 25 words per quote to maintain consistent card height (320px)
import { useTestimonials } from '../appServices/useTestimonials.js';

export default function Testimonials() {
  const { testimonials, isLoading } = useTestimonials();
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  if (isLoading && testimonials.length === 0) {
    return (
      <div className="bg-gray-50 py-16 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-md border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show the section if no testimonials
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slide {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-slide {
            animation: slide 30s linear infinite;
          }
        `
      }} />
      <section
        className="bg-gray-50 py-16 sm:py-10"
        aria-labelledby="trust-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="trust-heading"
            className="text-center text-2xl font-bold text-gray-900 sm:text-3xl mb-12"
          >
            Words of praise from others about our services
          </h2>

          {/* Testimonials Carousel */}
          <div className="relative overflow-hidden py-4">
            <div
              className="flex w-max animate-slide pl-6 pr-16 gap-10"
              style={{
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <div
                  key={`${testimonial.id || index}-${index}`}
                  className="flex-shrink-0 w-80 h-80 overflow-hidden rounded-md bg-white p-8 shadow-md flex flex-col justify-between relative"
                >
                  {/* Star Rating */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => {
                      const rating = testimonial.rating ?? 0;
                      const fillPercentage = Math.max(0, Math.min(100, (rating - i) * 100));

                      return (
                        <div key={i} className="relative h-4 w-4 flex-shrink-0">
                          {/* Background star: Black outline, no fill */}
                          <Star
                            className="absolute inset-0 h-4 w-4 text-yellow-600 stroke-[1.5]"
                            aria-hidden="true"
                          />
                          {/* Foreground star: Yellow fill, clipped by width */}
                          <div
                            className="absolute inset-0 overflow-hidden pointer-events-none"
                            style={{ width: `${fillPercentage}%` }}
                          >
                            <Star
                              className="h-4 w-4 text-yellow-400 fill-yellow-400 stroke-[1.5]"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6">
                    <Quote className="h-8 w-8 text-gray-300" aria-hidden="true" />
                  </div>

                  <div>
                    {/* Testimonial Text */}
                    <blockquote className="mb-8 pt-6">
                      <p className="text-gray-700 leading-relaxed text-sm italic">
                        "{testimonial.message}"
                      </p>
                    </blockquote>
                  </div>

                  {/* Profile Section */}
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.profilePic}
                      alt={`Photo of ${testimonial.customerName}`}
                      className="h-12 w-12 rounded-md object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{testimonial.customerName}</p>
                      <p className="text-xs text-gray-500">{testimonial.customerEmail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
