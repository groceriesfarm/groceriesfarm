import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';

const Categories = () => {
  const { categories, isLoading, loadProducts } = useProducts();
  const categoryEntries = Object.entries(categories);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleImageError = (categoryId: string) => {
    setImageErrors(prev => new Set([...prev, categoryId]));
  };

  const isValidImageUrl = (url?: string): boolean => {
    if (!url) return false;
    return url.startsWith('data:image/') || url.startsWith('http://') || url.startsWith('https://');
  };

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

        {/* Show skeleton ONLY if truly no data (not loading) */}
        {categoryEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LayoutGrid className="w-12 h-12 text-muted-foreground mb-4 animate-pulse" />
            <p className="text-muted-foreground">
              Loading categories...
            </p>
          </div>
        )}

        {/* Categories grid - shows instantly from cache */}
        {categoryEntries.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryEntries.map(([id, cat], i) => (
              <div
                key={id}
                className="group reveal rounded-xl overflow-hidden bg-card shadow-card border border-border hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
                style={{ transitionDelay: `${i * 0.05}s` }}
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  {isValidImageUrl(cat.image) && !imageErrors.has(id) ? (
                    <>
                      <img
                        src={cat.image}
                        alt={cat.name}
                        loading="lazy"
                        width={800}
                        height={600}
                        onError={() => handleImageError(id)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
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
        )}
      </div>
    </section>
  );
};

export default Categories;