import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container-main section-padding py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Logo className="h-7 w-7" />
              <h3 className="font-display text-xl font-bold text-primary">BulkStore</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted wholesale partner for premium quality ingredients and produce since 1998.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Categories</h4>
            <ul className="space-y-2">
              {['Spices', 'Pulses', 'Herbal Powders', 'Flours', 'Farming Products'].map((c) => (
                <li key={c}>
                  <span className="text-sm text-muted-foreground">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>+91 98765 43210</li>
              <li>info@bulkstore.com</li>
              <li>Mumbai, Maharashtra</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} BulkStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
