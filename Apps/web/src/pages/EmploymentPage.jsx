import { CheckCircle2 } from 'lucide-react';
import EmploymentForm from '../components/forms/EmploymentForm';
import serviceHero from '../assets/Service_Hero.png';

export default function EmploymentPage() {
  const benefits = [
    "Competitive compensation and flexible scheduling tailored to your life.",
    "Comprehensive orientation, mentorship, and continuous learning opportunities.",
    "Meaningful, purpose-driven work that profoundly impacts the lives of our clients and their families.",
    "A supportive, inclusive team that values your voice and professional growth.",
    "Recognition programs that celebrate exceptional service and dedication.",
    "Modern care tools and operational support that help you focus on people-first care."
  ];

  const expectations = [
    "A compassionate, client-first mindset with excellent communication skills.",
    "Professional reliability, accountability, and respect for confidentiality.",
    "A willingness to learn, adapt, and collaborate in a fast-moving care environment.",
    "Strong time management and attention to detail in day-to-day responsibilities.",
    "Commitment to safety standards and high-quality care outcomes.",
    "A positive, solution-oriented attitude that strengthens team culture and client trust."
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <img
          src={serviceHero}
          alt="Healthcare professionals"
          className="absolute inset-0 h-full w-full object-cover grayscale opacity-80 mix-blend-multiply"
          loading="eager"
        />
        <div className="absolute inset-0 bg-teal-900/75" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-100">Employment</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Join Our Team of Dedicated Professionals
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-teal-100 sm:text-lg">
            Make a meaningful difference in the lives of seniors and individuals needing support, while enjoying ongoing training, flexible scheduling, and a supportive team environment.
          </p>
        </div>
      </section>

      <section id="employment" className="px-4 py-16 sm:px-6 sm:py-10 lg:px-4">
        <div className="mx-auto">
          <div className="grid lg:grid-cols-2 items-stretch gap-1">

            {/* Left Column: Why join us? */}
            <div className="flex flex-col justify-start lg:mt-0 px-4 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="rounded-md bg-white p-8 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Why join us?</h3>
                <ul className="mt-6 space-y-5">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-teal-600" aria-hidden="true" />
                      <span className="text-slate-700 leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md bg-white p-8 shadow-sm ring-1 ring-slate-200 mt-6">
                <h3 className="text-xl font-semibold text-slate-900">What you bring to the table?</h3>
                <ul className="mt-6 space-y-5">
                  {expectations.map((item, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-teal-600" aria-hidden="true" />
                      <span className="text-slate-700 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Employment Form */}
            <div className="h-full lg:mt-0 px-4 flex flex-col items-center justify-start animate-in fade-in slide-in-from-right-8 duration-700">
              <EmploymentForm />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}