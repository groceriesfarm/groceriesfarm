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

// Helper function to sanitize category data (remove undefined values)
const sanitizeCategory = (category: ProductCategory) => {
  // Convert image to string if it's an object (imported asset)
  let imageToSave = category.image;
  if (typeof imageToSave === 'object' && imageToSave !== null) {
    imageToSave = String(imageToSave);
  }
  
  // Sanitize items array - remove undefined values from each product
  const sanitizedItems = (category.items || []).map((item) => ({
    id: item.id || '',
    name: item.name || '',
    category: item.category || '',
    image: item.image ? (typeof item.image === 'object' ? String(item.image) : item.image) : '',
  }));
  
  return {
    name: category.name || '',
    description: category.description || '',
    image: imageToSave || '',
    items: sanitizedItems,
  };
};

// Get all categories and products from Firestore
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

// Save a single category to Firestore
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

// Delete a category from Firestore
export const deleteCategoryFromFirebase = async (categoryId: string): Promise<void> => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error(`Error deleting category ${categoryId} from Firebase:`, error);
    throw error;
  }
};

// Sync all categories to Firestore (batch operation)
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
    console.log('All categories synced to Firebase');
  } catch (error) {
    console.error('Error syncing categories to Firebase:', error);
    throw error;
  }
};

// Export data to JSON (for backup/download)
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

// Import data from JSON file
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
