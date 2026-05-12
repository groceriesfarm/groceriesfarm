import { useSearchParams, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { useImageLoaderBatch } from '@/hooks/useImageLoader';

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const { categories } = useProducts();

  // Convert categories object to match old structure
  const productData = Object.entries(categories).reduce((acc, [key, cat]) => {
    acc[key] = {
      name: cat.name,
      items: cat.items.map(item => ({ name: item.name, image: item.image }))
    };
    return acc;
  }, {} as Record<string, { name: string; items: Array<{ name: string; image?: string }> }>);

  // Collect all image IDs for batch loading
  const allImageIds = Object.values(productData).flatMap(cat => 
    cat.items.map(item => item.image).filter(Boolean)
  );
  
  // Load all images at once
  const loadedImages = useImageLoaderBatch(allImageIds);

  // Filter products based on category parameter
  const filteredProducts = categoryFilter 
    ? Object.entries(productData).filter(([id]) => id === categoryFilter)
    : Object.entries(productData);

  const categoryName = categoryFilter && productData[categoryFilter] 
    ? productData[categoryFilter].name 
    : null;

  return (
    <section id="products" className="section-padding">
      <div className="container-main">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-wider uppercase text-primary">Our Inventory</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-2">
            {categoryName ? `${categoryName} Products` : 'Our Products'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            {categoryName 
              ? `Browse our premium ${categoryName.toLowerCase()} collection` 
              : 'Browse our extensive range of high-quality wholesale products'}
          </p>
          
          {/* Category Filter Badge */}
          {categoryFilter && (
            <div className="mt-4 flex justify-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                <span>Filtered by: {categoryName}</span>
                <X size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Link
            to="/products"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !categoryFilter 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary'
            }`}
          >
            All Products
          </Link>
          {Object.entries(productData).map(([id, cat]) => (
            <Link
              key={id}
              to={`/products?category=${id}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="space-y-12">
          {filteredProducts.map(([id, cat]) => (
            <div key={id} id={`product-${id}`} className="scroll-mt-20">
              <h3 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="w-1 h-8 rounded-full bg-primary" />
                {cat.name}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {cat.items.map((item) => (
                <div
                  key={item.name}
                  className="group rounded-xl bg-card border border-border shadow-card hover:shadow-soft hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img 
                      src={loadedImages[item.image || ''] || item.image} 
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Available in bulk</p>
                  </div>
                </div>
              ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
