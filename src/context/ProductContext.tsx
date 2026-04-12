import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  image?: string;
}

export interface ProductCategory {
  name: string;
  items: Product[];
}

interface ProductContextType {
  categories: Record<string, ProductCategory>;
  addProduct: (category: string, productName: string, imageUrl?: string) => void;
  deleteProduct: (category: string, productId: string) => void;
  editProduct: (category: string, productId: string, newName: string, imageUrl?: string) => void;
  loadProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const defaultCategories: Record<string, ProductCategory> = {
  spices: {
    name: 'Spices',
    items: [
      { id: '1', name: 'Turmeric', category: 'spices' },
      { id: '2', name: 'Red Chili Powder', category: 'spices' },
      { id: '3', name: 'Coriander Powder', category: 'spices' },
      { id: '4', name: 'Cumin Seeds', category: 'spices' },
      { id: '5', name: 'Black Pepper', category: 'spices' },
      { id: '6', name: 'Garam Masala', category: 'spices' },
      { id: '7', name: 'Cardamom', category: 'spices' },
      { id: '8', name: 'Cinnamon', category: 'spices' },
    ],
  },
  pulses: {
    name: 'Pulses',
    items: [
      { id: '9', name: 'Toor Dal', category: 'pulses' },
      { id: '10', name: 'Moong Dal', category: 'pulses' },
      { id: '11', name: 'Chana Dal', category: 'pulses' },
      { id: '12', name: 'Masoor Dal', category: 'pulses' },
      { id: '13', name: 'Urad Dal', category: 'pulses' },
      { id: '14', name: 'Rajma', category: 'pulses' },
      { id: '15', name: 'Chickpeas', category: 'pulses' },
      { id: '16', name: 'Green Moong', category: 'pulses' },
    ],
  },
  'herbal-powders': {
    name: 'Herbal Powders',
    items: [
      { id: '17', name: 'Moringa Powder', category: 'herbal-powders' },
      { id: '18', name: 'Ashwagandha', category: 'herbal-powders' },
      { id: '19', name: 'Neem Powder', category: 'herbal-powders' },
      { id: '20', name: 'Amla Powder', category: 'herbal-powders' },
      { id: '21', name: 'Henna Powder', category: 'herbal-powders' },
      { id: '22', name: 'Tulsi Powder', category: 'herbal-powders' },
    ],
  },
  flours: {
    name: 'Flours',
    items: [
      { id: '23', name: 'Wheat Flour', category: 'flours' },
      { id: '24', name: 'Rice Flour', category: 'flours' },
      { id: '25', name: 'Gram Flour (Besan)', category: 'flours' },
      { id: '26', name: 'Corn Flour', category: 'flours' },
      { id: '27', name: 'Ragi Flour', category: 'flours' },
      { id: '28', name: 'Multigrain Flour', category: 'flours' },
    ],
  },
  'farming-products': {
    name: 'Farming Products',
    items: [
      { id: '29', name: 'Basmati Rice', category: 'farming-products' },
      { id: '30', name: 'Wheat Grain', category: 'farming-products' },
      { id: '31', name: 'Jaggery', category: 'farming-products' },
      { id: '32', name: 'Mustard Seeds', category: 'farming-products' },
      { id: '33', name: 'Sesame Seeds', category: 'farming-products' },
      { id: '34', name: 'Groundnuts', category: 'farming-products' },
    ],
  },
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Record<string, ProductCategory>>(defaultCategories);

  // Load products from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('all_products');
    if (saved) {
      try {
        setCategories(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load products:', e);
      }
    }
  }, []);

  // Save to localStorage whenever categories change
  useEffect(() => {
    localStorage.setItem('all_products', JSON.stringify(categories));
  }, [categories]);

  const addProduct = (category: string, productName: string, imageUrl?: string) => {
    setCategories((prev) => {
      const updated = { ...prev };
      const id = Date.now().toString();
      const newProduct: Product = { id, name: productName, category, image: imageUrl };
      updated[category].items.push(newProduct);
      return updated;
    });
  };

  const deleteProduct = (category: string, productId: string) => {
    setCategories((prev) => {
      const updated = { ...prev };
      updated[category].items = updated[category].items.filter((p) => p.id !== productId);
      return updated;
    });
  };

  const editProduct = (category: string, productId: string, newName: string, imageUrl?: string) => {
    setCategories((prev) => {
      const updated = { ...prev };
      const product = updated[category].items.find((p) => p.id === productId);
      if (product) {
        product.name = newName;
        if (imageUrl) {
          product.image = imageUrl;
        }
      }
      return updated;
    });
  };

  const loadProducts = () => {
    const saved = localStorage.getItem('all_products');
    if (saved) {
      try {
        setCategories(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load products:', e);
      }
    }
  };

  return (
    <ProductContext.Provider value={{ categories, addProduct, deleteProduct, editProduct, loadProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};
