import HeroSection from '../components/HeroSection';
import ServiceToggle from '../components/ServiceToggle';
import BookingForm from '../components/BookingForm';
import TrustSignals from '../components/TrustSignals';
import CertificationStrip from '../components/CertificationStrip';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServiceToggle />
      <BookingForm />
      <TrustSignals />
      <CertificationStrip />
    </>
  );
}
