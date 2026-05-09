import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { Product, ProductCategory } from '@/context/ProductContext';

const CATEGORIES_COLLECTION = 'categories';

export interface FirebaseCategory extends ProductCategory {
  id?: string;
}

const sanitizeCategory = (category: ProductCategory) => {
  let imageToSave = category.image;

  // If image is a local imported asset object (not a URL string), don't save it
  // Local assets can't be stored in Firestore and should stay client-side only
  if (typeof imageToSave !== 'string' || imageToSave.startsWith('[object')) {
    imageToSave = '';
  }

  const sanitizedItems = (category.items || []).map((item) => ({
    id: item.id || '',
    name: item.name || '',
    category: item.category || '',
    image: typeof item.image === 'string' ? item.image : '',
  }));

  return {
    name: category.name || '',
    description: category.description || '',
    image: imageToSave || '',
    items: sanitizedItems,
  };
};

export const fetchCategoriesFromFirebase = async (): Promise<Record<string, ProductCategory>> => {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const snapshot = await getDocs(categoriesRef);
    const categories: Record<string, ProductCategory> = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      categories[doc.id] = {
        name: data.name,
        description: data.description,
        image: data.image,
        items: data.items || [],
      };
    });
    return categories;
  } catch (error) {
    console.error('Error fetching categories from Firebase:', error);
    return {};
  }
};

export const saveCategoryToFirebase = async (
  categoryId: string,
  category: ProductCategory
): Promise<void> => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    const sanitized = sanitizeCategory(category);
    await setDoc(categoryRef, {
      ...sanitized,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error saving category ${categoryId} to Firebase:`, error);
    throw error;
  }
};

export const deleteCategoryFromFirebase = async (categoryId: string): Promise<void> => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error(`Error deleting category ${categoryId} from Firebase:`, error);
    throw error;
  }
};

export const syncAllCategoriesToFirebase = async (
  categories: Record<string, ProductCategory>
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    Object.entries(categories).forEach(([categoryId, category]) => {
      const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
      const sanitized = sanitizeCategory(category);
      batch.set(categoryRef, {
        ...sanitized,
        updatedAt: new Date().toISOString(),
      });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error syncing categories to Firebase:', error);
    throw error;
  }
};

export const exportCategoriesAsJSON = (categories: Record<string, ProductCategory>) => {
  const jsonStr = JSON.stringify(categories, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `categories-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importCategoriesFromJSON = (file: File): Promise<Record<string, ProductCategory>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};