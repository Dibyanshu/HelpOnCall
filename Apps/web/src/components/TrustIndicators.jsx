import { Unlock, Zap, Clock9, HousePlus, CircleDollarSign } from 'lucide-react';

const features = [
  {
    name: 'Zero-Commitment Care',
    description: 'Enjoy the freedom of no long-term contracts.',
    icon: Unlock,
  },
  {
    name: 'On-Demand Support',
    description: 'Short-notice requests for when life happens fast.',
    icon: Zap,
  },
  {
    name: '24/7 Peace of Mind',
    description: 'Professional service available whenever you need it most.',
    icon: Clock9,
  },
  {
    name: 'First Step on Us',
    description: 'Free in-home assessment to find your perfect fit.',
    icon: HousePlus,
  },
  {
    name: 'Quality at Value',
    description: 'Premium care provided with competitive hourly rates.',
    icon: CircleDollarSign,
  },
];

export default function TrustIndicators() {
  return (
    <section className="bg-slate-50 py-10 sm:py-10" aria-labelledby="features-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 id="features-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl font-sans">
            Why Choose Our Services
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600 font-sans">
            We provide exceptional care tailored to your unique needs, offering flexibility and peace of mind.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className="group w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] relative flex flex-col bg-white/80 backdrop-blur-sm p-8 rounded-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-teal-50 shadow-inner transition-colors group-hover:bg-teal-100">
                    <Icon className="h-7 w-7 text-teal-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 font-sans">
                    {feature.name}
                  </h3>
                </div>
                <p className="text-base leading-loose text-slate-600 font-sans">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
