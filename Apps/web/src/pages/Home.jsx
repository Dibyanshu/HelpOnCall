import HeroSection from '../components/HeroSection';
import AboutUsCard from '../components/AboutUsCard';
import ServiceToggle from '../components/ServiceToggle';
import BookingForm from '../components/BookingForm';
import TrustSignals from '../components/TrustSignals';
import CertificationStrip from '../components/CertificationStrip';
import ContactForm from '../components/forms/ContactForm';

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="relative z-20 mx-auto -mt-12 max-w-6xl px-4 sm:-mt-16 sm:px-6 lg:-mt-20 lg:px-8">
        <AboutUsCard />
      </div>
      <ServiceToggle />
      <BookingForm />
      <TrustSignals />
      <CertificationStrip />
      <section id="contact" className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">Contact Us</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-gray-600 sm:text-base">
            Share your care needs and our team will get back to you with a tailored support plan.
          </p>
          <div className="mt-8 sm:mt-10">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
