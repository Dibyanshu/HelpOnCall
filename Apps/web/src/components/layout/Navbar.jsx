import { useState } from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'Home', href: '/', isRoute: true },
  { label: 'Nursing Services', href: '#nursing' },
  { label: 'Hospitality Services', href: '#hospitality' },
  { label: 'About Us', href: '/about', isRoute: true },
  { label: 'Contact Us', href: '/contact', isRoute: true },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link to="/" className="flex items-center gap-2" aria-label="Help On Call home">
          <svg
            className="h-8 w-8 text-teal-700"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z"
              fill="currentColor"
              opacity="0.15"
            />
            <path
              d="M16 6c-1.5 0-3 1-3 3v4h-4c-2 0-3 1.5-3 3s1 3 3 3h4v4c0 2 1.5 3 3 3s3-1 3-3v-4h4c2 0 3-1.5 3-3s-1-3-3-3h-4V9c0-2-1.5-3-3-3z"
              fill="currentColor"
            />
          </svg>
          <span className="text-lg font-bold text-gray-900">
            Help <span className="italic text-teal-700">On Call</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-6 md:flex" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              {link.isRoute ? (
                <Link
                  to={link.href}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
          <li>
            <a
              href="#booking"
              className="inline-flex items-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Book Now
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          <ul className="space-y-2 pt-2" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                {link.isRoute ? (
                  <Link
                    to={link.href}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
            <li>
              <a
                href="#booking"
                className="mt-2 block rounded-md bg-teal-700 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-teal-800"
                onClick={() => setMobileOpen(false)}
              >
                Book Now
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
