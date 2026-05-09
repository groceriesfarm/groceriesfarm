import React, { createContext, useContext, useState, useEffect } from 'react';
import spicesImg from '@/assets/category-spices.jpg';
import pulsesImg from '@/assets/category-pulses.jpg';
import herbalImg from '@/assets/category-herbal.jpg';
import floursImg from '@/assets/category-flours.jpg';
import farmingImg from '@/assets/category-farming.jpg';

import {
  fetchCategoriesFromFirebase,
  saveCategoryToFirebase,
  deleteCategoryFromFirebase,
  syncAllCategoriesToFirebase,
} from '@/services/firebaseService';

export interface Product {
  id: string;
  name: string;
  category: string;
  image?: string;
}

export interface ProductCategory {
  name: string;
  description?: string;
  image?: string;
  items: Product[];
}

interface ProductContextType {
  categories: Record<string, ProductCategory>;
  addProduct: (
    category: string,
    productName: string,
    imageUrl?: string
  ) => void;
  deleteProduct: (category: string, productId: string) => void;
  editProduct: (
    category: string,
    productId: string,
    newName: string,
    imageUrl?: string
  ) => void;
  addCategory: (
    categoryId: string,
    categoryName: string,
    description?: string,
    image?: string
  ) => void;
  editCategory: (
    categoryId: string,
    categoryName: string,
    description?: string,
    image?: string
  ) => void;
  deleteCategory: (categoryId: string) => void;
  loadProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(
  undefined
);

const defaultCategories: Record<string, ProductCategory> = {
  spices: {
    name: 'Spices',
    description:
      'Premium quality whole and ground spices sourced directly from farms.',
    image: spicesImg,
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
    description:
      'Wide range of lentils, beans, and legumes in bulk quantities.',
    image: pulsesImg,
    items: [
      { id: '9', name: 'Toor Dal', category: 'pulses' },
      { id: '10', name: 'Moong Dal', category: 'pulses' },
      { id: '11', name: 'Chana Dal', category: 'pulses' },
      { id: '12', name: 'Masoor Dal', category: 'pulses' },
    ],
  },

  'herbal-powders': {
    name: 'Herbal Powders',
    description:
      'Natural herbal powders for health, wellness, and beauty.',
    image: herbalImg,
    items: [
      { id: '17', name: 'Moringa Powder', category: 'herbal-powders' },
      { id: '18', name: 'Ashwagandha', category: 'herbal-powders' },
    ],
  },

  flours: {
    name: 'Flours',
    description:
      'Fresh milled flours including wheat, rice, gram, and specialty blends.',
    image: floursImg,
    items: [
      { id: '23', name: 'Wheat Flour', category: 'flours' },
      { id: '24', name: 'Rice Flour', category: 'flours' },
    ],
  },

  'farming-products': {
    name: 'Farming Products',
    description: 'Quality farming produce and agricultural products.',
    image: farmingImg,
    items: [
      { id: '29', name: 'Basmati Rice', category: 'farming-products' },
      { id: '30', name: 'Wheat Grain', category: 'farming-products' },
    ],
  },
};

export const ProductProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [categories, setCategories] =
    useState<Record<string, ProductCategory>>({});

  const [isLoading, setIsLoading] = useState(true);

  // LOAD DATA
  useEffect(() => {
    const loadData = async () => {
      try {
        // ALWAYS FETCH FROM FIREBASE FIRST
        const firebaseData = await fetchCategoriesFromFirebase();

        const merged: Record<string, ProductCategory> = {
          ...defaultCategories,
        };

        // MERGE FIREBASE DATA
        Object.keys(firebaseData || {}).forEach((key) => {
          const firebaseCategory = firebaseData[key];

          merged[key] = {
            name:
              firebaseCategory?.name ||
              defaultCategories[key]?.name ||
              key,

            description:
              firebaseCategory?.description ||
              defaultCategories[key]?.description ||
              'Premium wholesale products',

            image:
              firebaseCategory?.image ||
              defaultCategories[key]?.image ||
              '',

            items: Array.isArray(firebaseCategory?.items)
              ? firebaseCategory.items
              : [],
          };
        });

        setCategories(merged);

        // UPDATE LOCAL STORAGE
        localStorage.setItem(
          'all_products',
          JSON.stringify(merged)
        );
      } catch (error) {
        console.log('Firebase load failed:', error);

        // FALLBACK TO DEFAULTS
        setCategories(defaultCategories);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // SAVE TO LOCAL STORAGE + FIREBASE
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(
        'all_products',
        JSON.stringify(categories)
      );

      syncAllCategoriesToFirebase(categories).catch((err) =>
        console.log('Firebase sync error:', err.message)
      );
    }
  }, [categories, isLoading]);

  // ADD PRODUCT
  const addProduct = (
    category: string,
    productName: string,
    imageUrl?: string
  ) => {
    setCategories((prev) => {
      const updated = { ...prev };

      const id = Date.now().toString();

      const newProduct: Product = {
        id,
        name: productName,
        category,
        image: imageUrl,
      };

      if (!updated[category]) {
        updated[category] = {
          name: category,
          items: [],
        };
      }

      updated[category].items.push(newProduct);

      return updated;
    });
  };

  // DELETE PRODUCT
  const deleteProduct = (
    category: string,
    productId: string
  ) => {
    setCategories((prev) => {
      const updated = { ...prev };

      updated[category].items = updated[
        category
      ].items.filter((p) => p.id !== productId);

      return updated;
    });
  };

  // EDIT PRODUCT
  const editProduct = (
    category: string,
    productId: string,
    newName: string,
    imageUrl?: string
  ) => {
    setCategories((prev) => {
      const updated = { ...prev };

      const product = updated[category]?.items.find(
        (p) => p.id === productId
      );

      if (product) {
        product.name = newName;

        if (imageUrl) {
          product.image = imageUrl;
        }
      }

      return updated;
    });
  };

  // ADD CATEGORY
  const addCategory = (
    categoryId: string,
    categoryName: string,
    description?: string,
    image?: string
  ) => {
    setCategories((prev) => {
      const updated = { ...prev };

      if (!updated[categoryId]) {
        updated[categoryId] = {
          name: categoryName,
          description,
          image,
          items: [],
        };

        saveCategoryToFirebase(categoryId, {
          name: categoryName,
          description,
          image,
          items: [],
        }).catch((err) =>
          console.log('Firebase save error:', err.message)
        );
      }

      return updated;
    });
  };

  // EDIT CATEGORY
  const editCategory = (
    categoryId: string,
    categoryName: string,
    description?: string,
    image?: string
  ) => {
    setCategories((prev) => {
      const updated = { ...prev };

      if (updated[categoryId]) {
        updated[categoryId].name = categoryName;

        if (description !== undefined) {
          updated[categoryId].description = description;
        }

        if (image !== undefined) {
          updated[categoryId].image = image;
        }
      }

      return updated;
    });
  };

  // DELETE CATEGORY
  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => {
      const updated = { ...prev };

      delete updated[categoryId];

      return updated;
    });

    deleteCategoryFromFirebase(categoryId).catch((err) =>
      console.log('Firebase delete error:', err.message)
    );
  };

  // RELOAD PRODUCTS
  const loadProducts = async () => {
    try {
      const firebaseData = await fetchCategoriesFromFirebase();

      setCategories(firebaseData);
    } catch (e) {
      console.error('Failed to reload products:', e);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        categories,
        addProduct,
        deleteProduct,
        editProduct,
        addCategory,
        editCategory,
        deleteCategory,
        loadProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error(
      'useProducts must be used within ProductProvider'
    );
  }

  return context;
};