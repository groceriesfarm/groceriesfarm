import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Products from '@/components/Products';
import About from '@/components/About';
import Contact from '@/components/Contact';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Categories />
      <Products />
      <About />
      <Contact />
    </div>
  );
};

export default Home;
