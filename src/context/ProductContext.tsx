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

  deleteProduct: (
    category: string,
    productId: string
  ) => void;

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
    items: [],
  },

  pulses: {
    name: 'Pulses',
    description:
      'Wide range of lentils, beans, and legumes in bulk quantities.',
    image: pulsesImg,
    items: [],
  },

  'herbal-powders': {
    name: 'Herbal Powders',
    description:
      'Natural herbal powders for health, wellness, and beauty.',
    image: herbalImg,
    items: [],
  },

  flours: {
    name: 'Flours',
    description:
      'Fresh milled flours including wheat, rice, gram, and specialty blends.',
    image: floursImg,
    items: [],
  },

  'farming-products': {
    name: 'Farming Products',
    description:
      'Quality farming produce and agricultural products.',
    image: farmingImg,
    items: [],
  },
};

export const ProductProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {

  const [categories, setCategories] =
    useState<Record<string, ProductCategory>>(
      defaultCategories
    );

  const [isLoading, setIsLoading] = useState(true);

  // LOAD FIREBASE DATA
  useEffect(() => {

    const loadData = async () => {

      try {

        const firebaseData =
          await fetchCategoriesFromFirebase();

        const merged: Record<
          string,
          ProductCategory
        > = {
          ...defaultCategories,
        };

        // MERGE FIREBASE DATA
        Object.keys(firebaseData || {}).forEach((key) => {

          const firebaseCategory =
            firebaseData[key];

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

            items: Array.isArray(
              firebaseCategory?.items
            )
              ? firebaseCategory.items
              : [],
          };
        });

        setCategories(merged);

        localStorage.setItem(
          'all_products',
          JSON.stringify(merged)
        );

      } catch (error) {

        console.log(
          'Firebase load failed:',
          error
        );

        setCategories(defaultCategories);

      } finally {

        setIsLoading(false);
      }
    };

    loadData();

  }, []);

  // AUTO SAVE
  useEffect(() => {

    if (!isLoading) {

      localStorage.setItem(
        'all_products',
        JSON.stringify(categories)
      );

      syncAllCategoriesToFirebase(
        categories
      ).catch((err) =>
        console.log(
          'Firebase sync error:',
          err.message
        )
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
          description: '',
          image: '',
          items: [],
        };
      }

      updated[category].items.push(
        newProduct
      );

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

      updated[category].items =
        updated[category].items.filter(
          (p) => p.id !== productId
        );

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

      const product =
        updated[category]?.items.find(
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

        saveCategoryToFirebase(
          categoryId,
          updated[categoryId]
        ).catch((err) =>
          console.log(
            'Firebase save error:',
            err.message
          )
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

        updated[categoryId].name =
          categoryName;

        if (description !== undefined) {
          updated[categoryId].description =
            description;
        }

        if (image !== undefined) {
          updated[categoryId].image =
            image;
        }
      }

      return updated;
    });
  };

  // DELETE CATEGORY
  const deleteCategory = (
    categoryId: string
  ) => {

    setCategories((prev) => {

      const updated = { ...prev };

      delete updated[categoryId];

      return updated;
    });

    deleteCategoryFromFirebase(
      categoryId
    ).catch((err) =>
      console.log(
        'Firebase delete error:',
        err.message
      )
    );
  };

  // RELOAD
  const loadProducts = async () => {

    try {

      const firebaseData =
        await fetchCategoriesFromFirebase();

      setCategories(firebaseData);

    } catch (e) {

      console.error(
        'Failed to reload products:',
        e
      );
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

  const context = useContext(
    ProductContext
  );

  if (!context) {

    throw new Error(
      'useProducts must be used within ProductProvider'
    );
  }

  return context;
};