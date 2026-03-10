import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ServiceToggle from './components/ServiceToggle';
import BookingForm from './components/BookingForm';
import TrustSignals from './components/TrustSignals';
import CertificationStrip from './components/CertificationStrip';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-teal-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <ServiceToggle />
        <BookingForm />
        <TrustSignals />
        <CertificationStrip />
      </main>
      <Footer />
    </div>
  );
}

export default App;
