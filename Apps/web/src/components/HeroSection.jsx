export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-teal-900"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        {/* Text content */}
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:py-24 lg:pr-0">
          <h1
            id="hero-heading"
            className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Compassionate Care Meets World‑Class Hospitality in the Greater Toronto.
          </h1>
          <p className="mt-4 max-w-lg text-base text-teal-100 sm:text-lg">
            Compassionate Care Meets Hospitality in the Greater Toronto.
          </p>
          {/* <div className="mt-8">
            <a
              href="#services"
              className="inline-flex items-center rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              Explore Services
            </a>
          </div> */}
        </div>

        {/* Hero image */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
            alt="Healthcare professionals providing compassionate care"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>
      </div>

      {/* Mobile image */}
      <div className="lg:hidden">
        <img
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80"
          alt=""
          aria-hidden="true"
          className="h-48 w-full object-cover sm:h-64"
          loading="eager"
        />
      </div>
    </section>
  );
}
