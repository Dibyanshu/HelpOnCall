import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Phone, Mail, MapPin, Copy, Check } from 'lucide-react';

const quickLinks = [
  { label: 'Home', to: '/', end: true },
  { label: 'Services', to: '/services' },
  { label: 'About Us', to: '/about' },
  { label: 'Employment', to: '/employment' },
  { label: 'Staff Login', to: '/admin/login' },
];

const seoNeighborhoods = [
  'Toronto',
  'North York',
  'Scarborough',
  'Etobicoke',
];

const companyAddr = {
  address: "9999 Yonge Street, Unit 000",
  city: "Toronto, ON",
  postalCode: "M5E 1A1",
  phone1: "+1 416 893 1332",
  phone2: "+1 905 435 3688",
  email: "info@helponcall.ca"
};

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Get In Touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3 text-gray-300 hover:text-white">
                <MapPin className="text-teal-500 mt-1 shrink-0" size={18} />
                <span>{companyAddr.address}<br />{companyAddr.city} {companyAddr.postalCode}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <Phone className="text-teal-500 shrink-0" size={18} />
                <a href={`tel:${companyAddr.phone1.replace(/\s/g, '')}`}>{companyAddr.phone1}</a>
              </li>
              <li className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <Phone className="text-teal-500 shrink-0" size={18} />
                <a href={`tel:${companyAddr.phone2.replace(/\s/g, '')}`}>{companyAddr.phone2}</a>
              </li>
              <li className="flex items-center gap-3 text-gray-300 hover:text-teal-500 transition-colors group">
                <Mail className="text-teal-500 shrink-0" size={18} />
                <a href={`mailto:${companyAddr.email}`}>{companyAddr.email}</a>
                <button
                  onClick={() => copyToClipboard(companyAddr.email)}
                  className="ml-2 p-1 rounded-md text-gray-400 hover:bg-gray-800 hover:text-teal-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Copy email to clipboard"
                >
                  {copied ? <Check size={14} className="text-teal-500" /> : <Copy size={14} />}
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <nav aria-label="Footer quick links">
              <ul className="mt-4 space-y-3 text-sm" role="list">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        isActive
                          ? 'font-semibold text-white'
                          : 'hover:text-teal-400 transition-colors'
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Stay Updated */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Stay Updated
            </h3>
            <ul className="mt-4 flex gap-4 text-sm">
              <li>
                <a href="#" aria-label="Facebook" className="group flex items-center text-white relative w-6 h-6">
                  <svg className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <svg className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" aria-label="Instagram" className="group flex items-center text-white relative w-6 h-6">
                  <svg className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <svg className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" viewBox="0 0 24 24" width="24" height="24">
                    <defs>
                      <linearGradient id="ig-grad" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#405DE6" />
                        <stop offset="30%" stopColor="#5851DB" />
                        <stop offset="60%" stopColor="#833AB4" />
                        <stop offset="80%" stopColor="#C13584" />
                        <stop offset="100%" stopColor="#F56040" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" aria-label="LinkedIn" className="group flex items-center text-white relative w-6 h-6">
                  <svg className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <svg className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#0077b5" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" aria-label="YouTube" className="group flex items-center text-white relative w-6 h-6">
                  <svg className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <svg className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </li>
            </ul>
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Other Links
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <NavLink
                    to="/privacy-policy"
                    className={({ isActive }) =>
                      isActive ? 'font-semibold text-white' : 'hover:text-teal-400 transition-colors'
                    }
                  >
                    Privacy Policy
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/sitemap"
                    className={({ isActive }) =>
                      isActive ? 'font-semibold text-white' : 'hover:text-teal-400 transition-colors'
                    }
                  >
                    Sitemap
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>

          {/* SEO Focused */}
          <div className="sm:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              SEO Focused
            </h3>
            <p className="mt-4 text-sm leading-relaxed">
              The website is for a dedicated nursing/care and service areas provider.
              Toronto, North York, Scarborough, Etobicoke.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {seoNeighborhoods.map((area) => (
                <span
                  key={area}
                  className="inline-block rounded-md bg-gray-800 px-3 py-1 text-xs text-gray-300"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Help On Call. All rights reserved. Alt Toronto, North York, Scarborough, Etobicoke</p>
        </div>
      </div>
    </footer>
  );
}
