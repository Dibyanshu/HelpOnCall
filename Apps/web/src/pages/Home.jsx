import HeroSection from '../components/HeroSection';
import AboutUsCard from '../components/AboutUsCard';
import ServiceCard from '../components/ServiceCard';
import BookingForm from '../components/BookingForm';
import TrustSignals from '../components/TrustSignals';
import CertificationStrip from '../components/CertificationStrip';

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="relative z-20 mx-auto -mt-12 max-w-6xl px-4 sm:-mt-16 sm:px-6 lg:px-8">
        <AboutUsCard />
      </div>
      <ServiceCard />
      <BookingForm />
      <TrustSignals />
      <CertificationStrip />
    </>
  );
}
