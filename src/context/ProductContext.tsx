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
  isLoading: boolean;
  addProduct: (category: string, productName: string, imageUrl?: string) => void;
  deleteProduct: (category: string, productId: string) => void;
  editProduct: (category: string, productId: string, newName: string, imageUrl?: string) => void;
  addCategory: (categoryId: string, categoryName: string, description?: string, image?: string) => void;
  editCategory: (categoryId: string, categoryName: string, description?: string, image?: string) => void;
  deleteCategory: (categoryId: string) => void;
  loadProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

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

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Record<string, ProductCategory>>(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);

  // FIX: Track whether the initial Firebase load has completed.
  // This prevents the sync effect from writing defaultCategories
  // back to Firebase before the real data has been fetched.
  const isFirebaseLoaded = useRef(false);

  // FIX: Track whether the current categories change came from
  // a user action (add/edit/delete) vs a Firebase fetch.
  // Only sync to Firebase on user actions, not on fetches.
  const shouldSync = useRef(false);

  // ─── LOAD FROM FIREBASE ───────────────────────────────────────────
  const loadProducts = async () => {
    try {
      setIsLoading(true);

      const firebaseData = await fetchCategoriesFromFirebase();

      const merged: Record<string, ProductCategory> = { ...defaultCategories };

      Object.keys(firebaseData || {}).forEach((key) => {
        const firebaseCategory = firebaseData[key];
        merged[key] = {
          name: firebaseCategory?.name || defaultCategories[key]?.name || key,
          description:
            firebaseCategory?.description ||
            defaultCategories[key]?.description ||
            'Premium wholesale products',
          image: firebaseCategory?.image || defaultCategories[key]?.image || '',
          items: Array.isArray(firebaseCategory?.items) ? firebaseCategory.items : [],
        };
      });

      // FIX: Mark that we are setting state from a fetch — do NOT sync back to Firebase
      shouldSync.current = false;
      isFirebaseLoaded.current = true;

      setCategories(merged);
      localStorage.setItem('all_products', JSON.stringify(merged));
    } catch (error) {
      console.log('Firebase load failed:', error);
      // On error, fall back to localStorage if available
      const cached = localStorage.getItem('all_products');
      if (cached) {
        try {
          shouldSync.current = false;
          setCategories(JSON.parse(cached));
        } catch {
          setCategories(defaultCategories);
        }
      } else {
        setCategories(defaultCategories);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── INITIAL LOAD ─────────────────────────────────────────────────
  useEffect(() => {
    loadProducts();
  }, []);

  // ─── SYNC TO FIREBASE ON USER ACTIONS ONLY ───────────────────────
  // FIX: Only runs when shouldSync.current is true,
  // which is only set by add/edit/delete actions — never by loadProducts.
  useEffect(() => {
    if (!isFirebaseLoaded.current || !shouldSync.current) return;

    localStorage.setItem('all_products', JSON.stringify(categories));

    syncAllCategoriesToFirebase(categories).catch((err) =>
      console.log('Firebase sync error:', err.message)
    );

    // Reset after sync
    shouldSync.current = false;
  }, [categories]);

  // ─── ADD PRODUCT ─────────────────────────────────────────────────
  const addProduct = (category: string, productName: string, imageUrl?: string) => {
    shouldSync.current = true;
    setCategories((prev) => {
      const updated = { ...prev };
      const newProduct: Product = {
        id: Date.now().toString(),
        name: productName,
        category,
        image: imageUrl,
      };
      if (!updated[category]) {
        updated[category] = { name: category, description: '', image: '', items: [] };
      }
      updated[category].items.push(newProduct);
      return updated;
    });
  };

  // ─── DELETE PRODUCT ───────────────────────────────────────────────
  const deleteProduct = (category: string, productId: string) => {
    shouldSync.current = true;
    setCategories((prev) => {
      const updated = { ...prev };
      updated[category].items = updated[category].items.filter((p) => p.id !== productId);
      return updated;
    });
  };

  // ─── EDIT PRODUCT ─────────────────────────────────────────────────
  const editProduct = (category: string, productId: string, newName: string, imageUrl?: string) => {
    shouldSync.current = true;
    setCategories((prev) => {
      const updated = { ...prev };
      const product = updated[category]?.items.find((p) => p.id === productId);
      if (product) {
        product.name = newName;
        if (imageUrl) product.image = imageUrl;
      }
      return updated;
    });
  };

  // ─── ADD CATEGORY ─────────────────────────────────────────────────
  const addCategory = (
    categoryId: string,
    categoryName: string,
    description?: string,
    image?: string
  ) => {
    shouldSync.current = true;
    setCategories((prev) => {
      if (prev[categoryId]) return prev; // Already exists
      const updated = { ...prev };
      updated[categoryId] = { name: categoryName, description, image, items: [] };

      // Also save directly to Firebase immediately for reliability
      saveCategoryToFirebase(categoryId, updated[categoryId]).catch((err) =>
        console.log('Firebase save error:', err.message)
      );

      return updated;
    });
  };

  // ─── EDIT CATEGORY ────────────────────────────────────────────────
  const editCategory = (
    categoryId: string,
    categoryName: string,
    description?: string,
    image?: string
  ) => {
    shouldSync.current = true;
    setCategories((prev) => {
      if (!prev[categoryId]) return prev;
      const updated = { ...prev };
      updated[categoryId] = {
        ...updated[categoryId],
        name: categoryName,
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
      };
      return updated;
    });
  };

  // ─── DELETE CATEGORY ──────────────────────────────────────────────
  const deleteCategory = (categoryId: string) => {
    shouldSync.current = true;
    setCategories((prev) => {
      const updated = { ...prev };
      delete updated[categoryId];
      return updated;
    });
    deleteCategoryFromFirebase(categoryId).catch((err) =>
      console.log('Firebase delete error:', err.message)
    );
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