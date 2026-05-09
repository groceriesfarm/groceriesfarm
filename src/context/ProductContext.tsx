import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';

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

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with empty — everything comes from Firebase
  const [categories, setCategories] = useState<Record<string, ProductCategory>>({});
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ─── LOAD FROM FIREBASE ───────────────────────────────────────────
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const firebaseData = await fetchCategoriesFromFirebase();
      if (!isMounted.current) return;

      const loaded: Record<string, ProductCategory> = {};
      Object.keys(firebaseData || {}).forEach((key) => {
        const fc = firebaseData[key];
        loaded[key] = {
          name: fc?.name || key,
          description: fc?.description || '',
          image: fc?.image || '',
          items: Array.isArray(fc?.items) ? fc.items : [],
        };
      });

      setCategories(loaded);
      localStorage.setItem('all_products', JSON.stringify(loaded));
    } catch (error) {
      console.error('Firebase load failed:', error);
      if (!isMounted.current) return;
      // Fallback to localStorage cache if Firebase fails
      const cached = localStorage.getItem('all_products');
      if (cached) {
        try { setCategories(JSON.parse(cached)); } catch { setCategories({}); }
      } else {
        setCategories({});
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
      saveCategoryToFirebase(category, updated[category])
        .catch((err) => console.error('Firebase addProduct error:', err));
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
      saveCategoryToFirebase(category, updated[category])
        .catch((err) => console.error('Firebase deleteProduct error:', err));
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
      saveCategoryToFirebase(category, updated[category])
        .catch((err) => console.error('Firebase editProduct error:', err));
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
    // Write to Firebase first, then update local state
    await saveCategoryToFirebase(categoryId, newCategory);
    setCategories((prev) => ({
      ...prev,
      [categoryId]: newCategory,
    }));
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
      saveCategoryToFirebase(categoryId, updated[categoryId])
        .catch((err) => console.error('Firebase editCategory error:', err));
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