import { useSearchParams, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';

// Function to generate image URLs for each product using high-quality sources
const getProductImage = (productName: string): string => {
  // Map product names to quality product images
  const imageMap: Record<string, string> = {
    'Turmeric': 'https://5.imimg.com/data5/SELLER/Default/2024/7/436750334/EE/IY/SJ/19014369/natural-organic-turmeric-powder.jpg',
    'Red Chili Powder': 'https://vibrantliving.in/cdn/shop/files/RedChilliPowder.png?crop=center&height=1200&v=1731060133&width=1200',
    'Coriander Powder': 'https://shriradhespices.in/storage/news/gemini-generated-image-9s5hw29s5hw29s5h.jpg',
    'Cumin Seeds': 'https://nuttyyogi.com/cdn/shop/products/CuminSeeds.png?v=1680766965',
    'Black Pepper': 'https://www.stylecraze.com/wp-content/uploads/2013/06/17-Amazing-Benefits-Of-Black-Pepper-For-Skin-Hair-And-Health_1200px.jpg.webp',
    'Garam Masala': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxzKZpsgr1oFo2ZxrhM3rRaNql4Qr67-jrIA&s',
    'Cardamom': 'https://vibrantliving.in/cdn/shop/files/CardamomGreen.png?v=1731059940&width=2048',
    'Cinnamon': 'https://images.immediate.co.uk/production/volatile/sites/30/2016/08/cinnamon-benefits44-724deaf.jpg',
    'Toor Dal': 'https://aromaticessence.co/wp-content/uploads/2022/01/toor_dal.jpg',
    'Moong Dal': 'https://nuttyyogi.com/cdn/shop/products/MOOONG.jpg?v=1606373709',
    'Chana Dal': 'https://twobrothersindiashop.com/cdn/shop/articles/chana-dal-benefits.png?v=1694585472&width=1024',
    'Masoor Dal': 'https://healthymiller.com/cdn/shop/files/malkamasoor.png?v=1693908186',
    'Urad Dal': 'https://vrmshoppe.com/wp-content/uploads/2021/05/urad-dal-500x500fdsfdf.jpg',
    'Rajma': 'https://twobrothersindiashop.com/cdn/shop/articles/benefits-of-rajma.png?v=1691755459&width=1024',
    'Chickpeas': 'https://nutritionsource.hsph.harvard.edu/wp-content/uploads/2024/11/AdobeStock_118383793.jpeg',
    'Green Moong': 'https://c.ndtvimg.com/2023-07/rgfhdeg_green-moong-or-green-gram_625x300_12_July_23.jpg?im=FeatureCrop,algorithm=dnn,width=620,height=350?im=FaceCrop,algorithm=dnn,width=1200,height=886',
    'Moringa Powder': 'https://media.post.rvohealth.io/wp-content/uploads/2020/08/moringa-powder-for-weight-loss-732x549-thumbnail.jpg',
    'Ashwagandha': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRT770HKXY8unwmtCXzecyVOmF58mOENAQkFQ&s',
    'Neem Powder': 'https://tiimg.tistatic.com/fp/1/008/182/pure-herbal-neem-leaf-powder-for-healthy-skin-weight-loss-992.jpg',
    'Amla Powder': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCspD6Yv0eRwHm8WGLJ_g00P2RJNZ1_7f9GQ&s',
    'Henna Powder': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtlJJCpj2Fk5zdjSxIgMPP_Hd0Ht-625a9Qw&s',
    'Tulsi Powder': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScbNRZrFK2vVWMyErzouY0crbBHZJW1MVLWw&s',
    'Wheat Flour': 'https://urbandelight.in/cdn/shop/files/2_fb492171-ce87-4bb9-beb6-7f6e781084d0.jpg?v=1745755636&width=1445',
    'Rice Flour': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3MoNbpP7IGko2eYhXEhuTl1Zh8iKGbC-6GQ&s',
    'Gram Flour (Besan)': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkPwVX7uFpccPk3EjijE83PL_HU44_hqEPog&s',
    'Corn Flour': 'https://cdn.shopaccino.com/edible-smart/products/corn-flour-358794_l.jpg?v=704',
    'Ragi Flour': 'https://www.rootsveyr.com/wp-content/uploads/2022/08/Ragi-Flour.jpg',
    'Multigrain Flour': 'https://twobrothersindiashop.com/cdn/shop/articles/Cover_1.png?v=1686123617&width=1024',
    'Basmati Rice': 'https://thericechick.com/wp-content/uploads/2022/10/feature-3-what-is-basmati-rice.jpg',
    'Wheat Grain': 'https://m.media-amazon.com/images/I/51QQu6SogmL._AC_UF894,1000_QL80_.jpg',
    'Jaggery': 'https://www.apiimpex.com/assets/img/product-img/8.jpeg',
    'Mustard Seeds': 'https://sharmaglobletrade.com/wp-content/uploads/2024/08/Mustard-Seeds.jpg',
    'Sesame Seeds': 'https://5.imimg.com/data5/SELLER/Default/2021/8/VF/RB/PK/134706891/organic-til-white-sesame.jpg',
    'Groundnuts': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrdOf7_9rlSCZL_2X-lTtDK4_WFdNhCP98ZA&s',
  };

  return imageMap[productName] || 'https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?w=400&h=300&fit=crop';
};

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
                      src={item.image || getProductImage(item.name)} 
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
