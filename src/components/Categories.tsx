import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import spicesImg from '@/assets/category-spices.jpg';
import pulsesImg from '@/assets/category-pulses.jpg';
import herbalImg from '@/assets/category-herbal.jpg';
import floursImg from '@/assets/category-flours.jpg';
import farmingImg from '@/assets/category-farming.jpg';

const categories = [
  { id: 'spices', name: 'Spices', desc: 'Premium quality whole and ground spices sourced directly from farms.', img: spicesImg },
  { id: 'pulses', name: 'Pulses', desc: 'Wide range of lentils, beans, and legumes in bulk quantities.', img: pulsesImg },
  { id: 'herbal-powders', name: 'Herbal Powders', desc: 'Natural herbal powders for health, wellness, and beauty.', img: herbalImg },
  { id: 'flours', name: 'Flours', desc: 'Fresh milled flours including wheat, rice, gram, and specialty blends.', img: floursImg },
  { id: 'farming-products', name: 'Farming Products', desc: 'Quality farming produce and agricultural products.', img: farmingImg },
];

const Categories = () => {
  return (
    <section id="categories" className="section-padding bg-section-alt">
      <div className="container-main">
        <div className="text-center mb-12 reveal">
          <span className="text-xs font-semibold tracking-wider uppercase text-primary">What We Offer</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-2">Product Categories</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Explore our diverse range of premium wholesale products</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className="group reveal rounded-xl overflow-hidden bg-card shadow-card border border-border hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={cat.img}
                  alt={cat.name}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                <h3 className="absolute bottom-4 left-4 font-display text-xl font-bold text-primary-foreground">{cat.name}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground mb-4">{cat.desc}</p>
                <Link
                  to={`/products?category=${cat.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-3 transition-all"
                >
                  Explore Products <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
