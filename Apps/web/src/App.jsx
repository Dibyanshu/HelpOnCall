import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/ContactPage';
import Services from './pages/Services';

function App() {
  return (
    <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
    </Layout>
  );
}

export default App;
