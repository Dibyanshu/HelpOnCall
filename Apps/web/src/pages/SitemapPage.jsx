import { Link } from 'react-router-dom';

export default function SitemapPage() {
  const publicLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Employment', href: '/employment' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Sitemap</h1>
        <p className="mt-4 text-lg text-slate-600">
          A guide to navigating our website.
        </p>
      </div>

      <div className="rounded-md bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-6 text-xl font-semibold text-slate-900 border-b border-slate-100 pb-4">Main Pages</h2>
        <ul className="space-y-4">
          {publicLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-md p-4 transition-colors hover:bg-slate-50 border border-transparent hover:border-slate-100"
              >
                <div>
                  <h3 className="font-medium text-slate-900 group-hover:text-teal-600">{link.label}</h3>
                  <p className="mt-1 text-sm text-slate-500">helponcall.ca{link.href}</p>
                </div>
                <div className="mt-2 sm:mt-0 opacity-0 transition-opacity group-hover:opacity-100 hidden sm:block text-teal-600">
                  &rarr;
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
