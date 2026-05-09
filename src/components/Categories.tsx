import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';

const Categories = () => {
  const { categories, isLoading, loadProducts } = useProducts();

  useEffect(() => {
    // FIX 1: Always fetch fresh data when this component mounts.
    // Covers the case where user visits homepage directly.
    loadProducts();

    // FIX 2: Re-fetch when user returns to this tab from another tab/window.
    // Covers the case where admin added a category in another tab.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="categories" className="section-padding bg-section-alt">
      <div className="container-main">

        <div className="text-center mb-12 reveal">
          <span className="text-xs font-semibold tracking-wider uppercase text-primary">
            What We Offer
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Product Categories
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Explore our diverse range of premium wholesale products
          </p>
        </div>

        {/* Loading state */}
        {isLoading && Object.keys(categories).length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(categories).map(([id, cat], i) => (
            <div
              key={id}
              className="group reveal rounded-xl overflow-hidden bg-card shadow-card border border-border hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={
                    cat.image ||
                    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1gkutdgQHhRK_4bHIaWtDRkIgd1Fgquoj-g&s'
                  }
                  alt={cat.name}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                <h3 className="absolute bottom-4 left-4 font-display text-xl font-bold text-primary-foreground">
                  {cat.name}
                </h3>
              </div>

              <div className="p-5">
                <p className="text-sm text-muted-foreground mb-4">
                  {cat.description || 'Premium wholesale products'}
                </p>
                <Link
                  to={`/products?category=${id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-3 transition-all"
                >
                  Explore Products
                  <ArrowRight size={14} />
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