const quickLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Nursing', href: '#nursing' },
  { label: 'Hospitality', href: '#hospitality' },
  { label: 'Book Now', href: '#booking' },
  { label: 'Staff Login', href: '/admin/login' },
  { label: 'User Registration', href: '/register' },
];

const seoNeighborhoods = [
  'Toronto',
  'North York',
  'Scarborough',
  'Etobicoke',
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact Info
            </h3>
            <address className="mt-4 space-y-2 not-italic text-sm">
              <p>
                <a href="tel:+13168681228" className="hover:text-white transition-colors">
                  +1 316 868 1228
                </a>
              </p>
              <p>
                <a href="tel:+19054353688" className="hover:text-white transition-colors">
                  +1 905 435 3688
                </a>
              </p>
              <p>
                <a href="mailto:torontocareandstay@care.com" className="hover:text-white transition-colors">
                  torontocareandstay@care.com
                </a>
              </p>
            </address>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <nav aria-label="Footer quick links">
              <ul className="mt-4 space-y-2 text-sm" role="list">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
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
                  className="inline-block rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Toronto Care &amp; Stay. All rights reserved.</p>
          <p className="mt-1">
            Alt Toronto, North York, Scarborough, Etobicoke
          </p>
        </div>
      </div>
    </footer>
  );
}
