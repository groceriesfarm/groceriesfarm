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
  const [categories, setCategories] = useState<Record<string, ProductCategory>>({});
  const [isLoading, setIsLoading] = useState(false); // Start false - cache loads instantly
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // 🚀 INSTANT CACHE LOAD ON MOUNT
  useEffect(() => {
    const cached = localStorage.getItem('all_products');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setCategories(parsed);
      } catch {
        setCategories({});
      }
    }
    // Background Firebase refresh
    loadProducts().catch(console.error);
  }, []);

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
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

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
      saveCategoryToFirebase(category, updated[category]).catch(console.error);
      localStorage.setItem('all_products', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteProduct = (category: string, productId: string) => {
    setCategories((prev) => {
      const updated = { ...prev };
      updated[category] = {
        ...updated[category],
        items: updated[category].items.filter((p) => p.id !== productId),
      };
      saveCategoryToFirebase(category, updated[category]).catch(console.error);
      localStorage.setItem('all_products', JSON.stringify(updated));
      return updated;
    });
  };

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
      saveCategoryToFirebase(category, updated[category]).catch(console.error);
      localStorage.setItem('all_products', JSON.stringify(updated));
      return updated;
    });
  };

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
    await saveCategoryToFirebase(categoryId, newCategory);
    setCategories((prev) => {
      const updated = { ...prev, [categoryId]: newCategory };
      localStorage.setItem('all_products', JSON.stringify(updated));
      return updated;
    });
  };

  const editCategory = async (
    categoryId: string,
    categoryName: string,
    description?: string,
    image?: string
  ): Promise<void> => {
    setCategories((prev) => {
      if (!prev[categoryId]) return prev;
      const updatedCategory = {
        ...prev[categoryId],
        name: categoryName,
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
      };
      const updated = { ...prev, [categoryId]: updatedCategory };
      saveCategoryToFirebase(categoryId, updatedCategory).catch(console.error);
      localStorage.setItem('all_products', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteCategory = (categoryId: string) => {
    deleteCategoryFromFirebase(categoryId).catch(console.error);
    setCategories((prev) => {
      const updated = { ...prev };
      delete updated[categoryId];
      localStorage.setItem('all_products', JSON.stringify(updated));
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