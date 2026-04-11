import { useTheme } from '@/hooks/useTheme';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Products from '@/components/Products';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Index = () => {
  const { isDark, toggle } = useTheme();
  useScrollReveal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar isDark={isDark} toggleTheme={toggle} />
      <Hero />
      <Categories />
      <Products />
      <About />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
