import aboutUsHero from '../assets/AboutUs_Hero.png';

export default function AboutUsPage() {
  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <img
          src={aboutUsHero}
          alt="Healthcare professional supporting a senior at home"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-teal-900/75" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-100">About Help On Call</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Care That Feels Personal, Hospitality That Feels Like Home
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-teal-100 sm:text-lg">
            We support families across the GTA with a unique model that combines trusted nursing care and concierge-level hospitality services.
          </p>
        </div>
      </section>

      <section id="team-values" className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-10 sm:pt-12 lg:px-8 lg:pb-10 lg:pt-14">
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Our Core Values</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
            The standards below guide every interaction, care plan, and hospitality touchpoint we deliver across the GTA.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Compassion First</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Every service plan starts with empathy, dignity, and personalized communication for clients and families.
            </p>
          </article>
          <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Clinical Excellence</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Our professionals follow evidence-based practices and maintain high standards for safety and quality outcomes.
            </p>
          </article>
          <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">GTA Coverage</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              We provide coordinated support across Toronto, North York, Scarborough, and Etobicoke with responsive scheduling.
            </p>
          </article>
        </div>
      </section>

      <section id="team-values" className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-10 sm:pt-10 lg:px-8 lg:pb-10 lg:pt-10">
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Our Mission & Values</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
            Help On Call has the mission to offer a range of professional services that enables individuals to overcome challenges, foster resilience, and achieve emotional well-being to carry out their activities of daily living. We strive to create a safe and inclusive space where you can explore your thoughts and emotions, and achieve them with much needed support from us.
          </p>
        </div>
      </section>
    </div>
  );
}
