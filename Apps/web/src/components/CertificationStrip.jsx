const certifications = [
  { name: 'RNAO', abbr: 'RNAO' },
  { name: 'CNO', abbr: 'CNO' },
  { name: 'Ontario Health Care', abbr: 'OHC' },
  { name: 'Ontario Healthcare', abbr: 'OH' },
];

export default function CertificationStrip() {
  return (
    <section
      className="bg-white py-12 sm:py-16"
      aria-labelledby="cert-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="cert-heading"
          className="text-center text-2xl font-bold text-gray-900 sm:text-3xl"
        >
          Certification Strip
        </h2>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {certifications.map((cert) => (
            <div
              key={cert.name}
              className="flex items-center gap-3"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100"
                aria-hidden="true"
              >
                <span className="text-sm font-bold text-gray-600">{cert.abbr}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{cert.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
