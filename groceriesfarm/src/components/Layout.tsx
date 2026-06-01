import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const { isDark, toggle } = useTheme();
  const location = useLocation();
  useScrollReveal();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar isDark={isDark} toggleTheme={toggle} />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Layout;
