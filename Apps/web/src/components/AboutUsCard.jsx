export default function AboutUsCard({
  title = 'Dedicated to Your Well-Being in the GTA',
  description = 'Our team blends healthcare expertise with hospitality-driven service to support families, seniors, and professionals across Toronto and surrounding neighborhoods.',
  buttonLink = '#about',
  buttonLabel = 'Learn More About Our Team',
}) {
  return (
    <section aria-label="About us highlight" className="w-full">
      <div className="rounded-2xl border border-teal-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-3">
            <h3 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
              {description}
            </p>
          </div>

          <a
            href='/about'
            className="inline-flex w-full items-center justify-center rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 md:w-auto"
          >
            {buttonLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
