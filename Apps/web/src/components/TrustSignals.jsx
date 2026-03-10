import { useState } from 'react';

const testimonials = [
  {
    quote:
      'Wormy customer, where are saving contemplation. Compassionate care and client esprit/able in the world.',
    name: 'Jane Martin',
    role: 'Customer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
  },
  {
    quote:
      'The nursing team was incredibly professional and caring. They made our family feel supported every step of the way.',
    name: 'David Chen',
    role: 'Customer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
  },
  {
    quote:
      'Outstanding hospitality services. The corporate housing exceeded all our expectations for comfort and quality.',
    name: 'Sarah Thompson',
    role: 'Customer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
  },
];

export default function TrustSignals() {
  const [current, setCurrent] = useState(0);

  const goTo = (index) => setCurrent(index);

  return (
    <section
      className="bg-gray-50 py-16 sm:py-20"
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="trust-heading"
          className="text-center text-2xl font-bold text-gray-900 sm:text-3xl"
        >
          Trust Signals
        </h2>

        {/* Testimonial carousel */}
        <div className="relative mt-10 mx-auto max-w-2xl">
          <div
            className="overflow-hidden rounded-xl bg-white p-6 shadow-md sm:p-8"
            role="region"
            aria-roledescription="carousel"
            aria-label="Customer testimonials"
          >
            <div className="flex flex-col items-center text-center">
              <img
                src={testimonials[current].image}
                alt={`Photo of ${testimonials[current].name}`}
                className="h-16 w-16 rounded-full object-cover"
                loading="lazy"
              />
              <blockquote className="mt-4">
                <p className="text-gray-700 italic leading-relaxed">
                  &ldquo;{testimonials[current].quote}&rdquo;
                </p>
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold text-gray-900">{testimonials[current].name}</p>
                <p className="text-sm text-gray-500">{testimonials[current].role}</p>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            type="button"
            className="absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            onClick={() => goTo((current - 1 + testimonials.length) % testimonials.length)}
            aria-label="Previous testimonial"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            className="absolute right-0 top-1/2 translate-x-4 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            onClick={() => goTo((current + 1) % testimonials.length)}
            aria-label="Next testimonial"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Testimonial slides">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === current ? 'bg-teal-700' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
