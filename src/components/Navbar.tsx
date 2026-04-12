import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, Settings } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const links = [
  { label: 'Home', href: '/' },
  { label: 'Categories', href: '/categories' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const Navbar = ({ isDark, toggleTheme }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-card/95 backdrop-blur-md shadow-soft border-b border-border'
          : 'bg-card/90 backdrop-blur-md shadow-sm border-b border-border/50'
      }`}
    >
      <div className="w-full max-w-screen-2xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left: Logo and Brand */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0 mr-8">
          <Logo className="h-8 w-8 transition-transform group-hover:scale-110" />
          <span className="font-display text-xl font-bold text-primary group-hover:text-primary/80 transition-colors">
            Groceries Farm
          </span>
        </Link>

        {/* Spacer to push nav to right */}
        <div className="flex-1"></div>

        {/* Right: Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {links.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(l.href)
                  ? 'text-primary bg-primary/10'
                  : 'text-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className={`ml-2 p-2.5 rounded-lg transition-colors bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to="/admin"
            className={`ml-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              isActive('/admin')
                ? 'text-primary bg-primary/10'
                : 'text-foreground hover:text-primary hover:bg-primary/5'
            }`}
            title="Admin Panel"
          >
            <Settings size={18} />
            <span className="hidden lg:inline">Admin</span>
          </Link>
        </div>

        {/* Right: Mobile Menu Buttons */}
        <div className="flex md:hidden items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg transition-colors bg-secondary text-secondary-foreground`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2.5 rounded-lg transition-colors bg-secondary text-secondary-foreground`}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-md border-b border-border animate-fade-in">
          <div className="px-4 py-3 flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setMobileOpen(false)}
                className={`text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(l.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={`text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/admin')
                  ? 'text-primary bg-primary/10'
                  : 'text-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              <Settings size={18} />
              Admin Panel
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
