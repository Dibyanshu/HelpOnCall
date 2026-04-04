import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import helpOnCallLogo from '../../assets/helpOnCallLogo.png';

const navLinks = [
  { label: 'Home', href: '/', isRoute: true },
  { label: 'Our Services', href: '/services', isRoute: true },
  { label: 'About Us', href: '/about', isRoute: true },
  { label: 'Employment', href: '/employment', isRoute: true },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }

    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <nav
        className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link to="/" className="flex items-center gap-3" aria-label="Help On Call home">
          <img
            src={helpOnCallLogo}
            alt="Help On Call"
            className="h-10 w-auto max-w-[180px] object-contain sm:h-11 sm:max-w-[210px]"
            loading="eager"
          />
          <div className="hidden sm:block leading-tight">
            <p className="text-[15px] font-semibold tracking-tight text-slate-900">Help On Call</p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-teal-700">Helping hands, always on call</p>
          </div>
        </Link>

        <ul className="hidden items-center gap-6 md:flex" role="list">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href} className="relative py-2">
                {link.isRoute ? (
                  <Link
                    to={link.href}
                    className={`text-sm font-medium transition-all duration-300 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${active ? 'text-teal-700' : 'text-gray-700'
                      }`}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className={`text-sm font-medium transition-all duration-300 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${active ? 'text-teal-700' : 'text-gray-700'
                      }`}
                  >
                    {link.label}
                  </a>
                )}
                {/* Active Indicator Underline */}
                {active && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-teal-700 animate-in fade-in slide-in-from-bottom-1 duration-300" />
                )}
              </li>
            );
          })}
          <li>
            <Link
              to="/quote"
              className="btn-primary"
            >
              Request For Quote
            </Link>
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
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50 hover:text-teal-700'
                        }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50 hover:text-teal-700'
                        }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              );
            })}
            <li>
              <Link
                to="/quote"
                className="mt-2 btn-primary w-full flex justify-center"
                onClick={() => setMobileOpen(false)}
              >
                Request A Quote
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
