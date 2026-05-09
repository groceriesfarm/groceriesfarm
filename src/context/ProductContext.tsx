import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';

import spicesImg from '@/assets/category-spices.jpg';
import pulsesImg from '@/assets/category-pulses.jpg';
import herbalImg from '@/assets/category-herbal.jpg';
import floursImg from '@/assets/category-flours.jpg';
import farmingImg from '@/assets/category-farming.jpg';

import {
  fetchCategoriesFromFirebase,
  saveCategoryToFirebase,
  deleteCategoryFromFirebase,
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
  isLoading: boolean;
  addProduct: (category: string, productName: string, imageUrl?: string) => void;
  deleteProduct: (category: string, productId: string) => void;
  editProduct: (category: string, productId: string, newName: string, imageUrl?: string) => void;
  addCategory: (categoryId: string, categoryName: string, description?: string, image?: string) => Promise<void>;
  editCategory: (categoryId: string, categoryName: string, description?: string, image?: string) => Promise<void>;
  deleteCategory: (categoryId: string) => void;
  loadProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Default categories use LOCAL images (never written to Firebase)
// Firebase only stores admin-added categories with URL-based images
const defaultCategories: Record<string, ProductCategory> = {
  spices: {
    name: 'Spices',
    description: 'Premium quality whole and ground spices sourced directly from farms.',
    image: spicesImg,
    items: [],
  },
  pulses: {
    name: 'Pulses',
    description: 'Wide range of lentils, beans, and legumes in bulk quantities.',
    image: pulsesImg,
    items: [],
  },
  'herbal-powders': {
    name: 'Herbal Powders',
    description: 'Natural herbal powders for health, wellness, and beauty.',
    image: herbalImg,
    items: [],
  },
  flours: {
    name: 'Flours',
    description: 'Fresh milled flours including wheat, rice, gram, and specialty blends.',
    image: floursImg,
    items: [],
  },
  'farming-products': {
    name: 'Farming Products',
    description: 'Quality farming produce and agricultural products.',
    image: farmingImg,
    items: [],
  },
};

// IDs of built-in default categories — these are never written to Firebase
const DEFAULT_CATEGORY_IDS = new Set(Object.keys(defaultCategories));

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Record<string, ProductCategory>>(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ─── LOAD FROM FIREBASE ───────────────────────────────────────────
  // Merges Firebase data (admin-added categories + updated items) with
  // defaultCategories (which keep their local asset images).
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const firebaseData = await fetchCategoriesFromFirebase();

      if (!isMounted.current) return;

      // Start with defaults so local images are always preserved
      const merged: Record<string, ProductCategory> = { ...defaultCategories };

      Object.keys(firebaseData || {}).forEach((key) => {
        const fc = firebaseData[key];
        if (DEFAULT_CATEGORY_IDS.has(key)) {
          // For default categories: only update items from Firebase,
          // keep local name/description/image so assets are never broken
          merged[key] = {
            ...defaultCategories[key],
            items: Array.isArray(fc?.items) ? fc.items : [],
          };
        } else {
          // For admin-added categories: use everything from Firebase
          merged[key] = {
            name: fc?.name || key,
            description: fc?.description || 'Premium wholesale products',
            image: fc?.image || '',
            items: Array.isArray(fc?.items) ? fc.items : [],
          };
        }
      });

      setCategories(merged);
      localStorage.setItem('all_products', JSON.stringify(merged));
    } catch (error) {
      console.error('Firebase load failed:', error);
      if (!isMounted.current) return;
      const cached = localStorage.getItem('all_products');
      if (cached) {
        try { setCategories(JSON.parse(cached)); } catch { setCategories(defaultCategories); }
      } else {
        setCategories(defaultCategories);
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // ─── INITIAL LOAD ─────────────────────────────────────────────────
  useEffect(() => {
    loadProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── ADD PRODUCT ──────────────────────────────────────────────────
  const addProduct = (category: string, productName: string, imageUrl?: string) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: productName,
      category,
      image: imageUrl || '',
    };
    setCategories((prev) => {
      const updated = { ...prev };
      if (!updated[category]) {
        updated[category] = { name: category, description: '', image: '', items: [] };
      }
      updated[category] = {
        ...updated[category],
        items: [...updated[category].items, newProduct],
      };
      // Write only items to Firebase for this category
      saveCategoryToFirebase(category, {
        ...updated[category],
        // Never send local asset objects to Firebase
        image: DEFAULT_CATEGORY_IDS.has(category) ? '' : (updated[category].image || ''),
      }).catch((err) => console.error('Firebase addProduct error:', err));
      return updated;
    });
  };

  // ─── DELETE PRODUCT ───────────────────────────────────────────────
  const deleteProduct = (category: string, productId: string) => {
    setCategories((prev) => {
      const updated = { ...prev };
      updated[category] = {
        ...updated[category],
        items: updated[category].items.filter((p) => p.id !== productId),
      };
      saveCategoryToFirebase(category, {
        ...updated[category],
        image: DEFAULT_CATEGORY_IDS.has(category) ? '' : (updated[category].image || ''),
      }).catch((err) => console.error('Firebase deleteProduct error:', err));
      return updated;
    });
  };

  // ─── EDIT PRODUCT ─────────────────────────────────────────────────
  const editProduct = (category: string, productId: string, newName: string, imageUrl?: string) => {
    setCategories((prev) => {
      const updated = { ...prev };
      updated[category] = {
        ...updated[category],
        items: updated[category].items.map((p) =>
          p.id === productId
            ? { ...p, name: newName, ...(imageUrl && { image: imageUrl }) }
            : p
        ),
      };
      saveCategoryToFirebase(category, {
        ...updated[category],
        image: DEFAULT_CATEGORY_IDS.has(category) ? '' : (updated[category].image || ''),
      }).catch((err) => console.error('Firebase editProduct error:', err));
      return updated;
    });
  };

  // ─── ADD CATEGORY ─────────────────────────────────────────────────
  const addCategory = async (
    categoryId: string,
    categoryName: string,
    description?: string,
    image?: string
  ): Promise<void> => {
    const newCategory: ProductCategory = {
      name: categoryName,
      description: description || '',
      image: image || '',
      items: [],
    };
    // Write to Firebase first, then update state
    await saveCategoryToFirebase(categoryId, newCategory);
    setCategories((prev) => {
      if (prev[categoryId]) return prev;
      return { ...prev, [categoryId]: newCategory };
    });
  };

  // ─── EDIT CATEGORY ────────────────────────────────────────────────
  const editCategory = async (
    categoryId: string,
    categoryName: string,
    description?: string,
    image?: string
  ): Promise<void> => {
    setCategories((prev) => {
      if (!prev[categoryId]) return prev;
      const updated = {
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          name: categoryName,
          ...(description !== undefined && { description }),
          ...(image !== undefined && { image }),
        },
      };
      saveCategoryToFirebase(categoryId, {
        ...updated[categoryId],
        image: DEFAULT_CATEGORY_IDS.has(categoryId) ? '' : (updated[categoryId].image || ''),
      }).catch((err) => console.error('Firebase editCategory error:', err));
      return updated;
    });
  };

  // ─── DELETE CATEGORY ──────────────────────────────────────────────
  const deleteCategory = (categoryId: string) => {
    deleteCategoryFromFirebase(categoryId)
      .catch((err) => console.error('Firebase deleteCategory error:', err));
    setCategories((prev) => {
      const updated = { ...prev };
      delete updated[categoryId];
      return updated;
    });
  };

  return (
    <ProductContext.Provider
      value={{
        categories,
        isLoading,
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
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
};