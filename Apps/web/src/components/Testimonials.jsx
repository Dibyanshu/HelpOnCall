import { useState, useEffect } from 'react';
import { Quote, Star } from 'lucide-react';

// Maximum 25 words per quote to maintain consistent card height (320px)
const testimonials = [
  {
    quote:
      'The progress tracker is fantastic and motivating. It helps me see improvements over time with a great mix of common and',
    highlightedWord: 'challenging',
    mainQuoteEnd: 'vocabulary words that keep me engaged.',
    name: 'Fatima Khoury',
    handle: 'dilatory_curtains_98',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    rating: 5,
  },
  {
    quote:
      'The nursing team was incredibly professional and caring throughout our experience. They made our family feel truly supported with their',
    highlightedWord: 'exceptional',
    mainQuoteEnd: 'care and attention to our needs.',
    name: 'David Chen',
    handle: 'david_chen_wellness',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    rating: 5,
  },
  {
    quote:
      'Outstanding services with great attention to detail. The corporate solutions exceeded all expectations for comfort and',
    highlightedWord: 'quality',
    mainQuoteEnd: 'standards in every aspect of service.',
    name: 'Sarah Thompson',
    handle: 'sarah_thompson_corp',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
    rating: 5,
  },
  {
    quote:
      'The customer support team went above and beyond to ensure complete satisfaction. Their dedication to providing',
    highlightedWord: 'excellent',
    mainQuoteEnd: 'service is truly commendable and professional.',
    name: 'Michael Rodriguez',
    handle: 'michael_rodriguez_pro',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    rating: 5,
  },
  {
    quote:
      'From start to finish, the entire process was seamless and highly professional. The team\'s expertise and',
    highlightedWord: 'commitment',
    mainQuoteEnd: 'to excellence made all the difference in results.',
    name: 'Emily Johnson',
    handle: 'emily_johnson_expert',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    rating: 5,
  },
  {
    quote:
      'I was impressed by the innovative approach and meticulous attention to detail. The final result exceeded my',
    highlightedWord: 'expectations',
    mainQuoteEnd: 'in every way possible with outstanding quality.',
    name: 'James Wilson',
    handle: 'james_wilson_innovator',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    rating: 5,
  },
];

export default function Testimonials() {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];

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
                  key={`${testimonial.name}-${index}`}
                  className="flex-shrink-0 w-80 h-80 overflow-hidden rounded-xl bg-white p-8 shadow-md flex flex-col justify-between relative"
                >
                  {/* Star Rating */}
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" aria-hidden="true" />
                    ))}
                  </div>

                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6">
                    <Quote className="h-8 w-8 text-gray-300" aria-hidden="true" />
                  </div>

                  <div>
                    {/* Testimonial Text */}
                    <blockquote className="mb-8 pt-6">
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {testimonial.quote} <span className="text-orange-500 font-medium">{testimonial.highlightedWord}</span> {testimonial.mainQuoteEnd}
                      </p>
                    </blockquote>
                  </div>

                  {/* Profile Section */}
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={`Photo of ${testimonial.name}`}
                      className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                      <p className="text-xs text-gray-500">{testimonial.handle}</p>
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
