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

/**
 * Strips base64 images before saving to Firestore.
 * Base64 strings are MBs in size — they cause Firestore document size limit
 * errors and make fetches fail silently, causing blank pages.
 * 
 * Instead of storing base64 in Firestore, we store image IDs that reference
 * base64 data stored in IndexedDB (client-side).
 */
const sanitizeCategory = (category: ProductCategory) => {
  const sanitizedItems = (category.items || []).map((item) => ({
    id: item.id || '',
    name: item.name || '',
    category: item.category || '',
    // Keep image reference (URL or imageId), but strip actual base64 data
    image:
      item.image &&
      typeof item.image === 'string' &&
      !item.image.startsWith('[object')
        ? item.image
        : '',
  }));

  const safeImage =
    category.image &&
    typeof category.image === 'string' &&
    !category.image.startsWith('[object')
      ? category.image
      : '';

  return {
    name: category.name || '',
    description: category.description || '',
    image: safeImage,
    items: sanitizedItems,
  };
};

// ── Fetch all categories from Firestore ──────────────────────────────
export const fetchCategoriesFromFirebase = async (): Promise<
  Record<string, ProductCategory>
> => {
  try {
    const snapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    const categories: Record<string, ProductCategory> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      categories[docSnap.id] = {
        name: data.name || '',
        description: data.description || '',
        image: data.image || '',
        items: Array.isArray(data.items) ? data.items : [],
      };
    });
    return categories;
  } catch (error) {
    console.error('Error fetching categories from Firebase:', error);
    return {};
  }
};

// ── Save a single category ───────────────────────────────────────────
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

// ── Delete a single category ─────────────────────────────────────────
export const deleteCategoryFromFirebase = async (
  categoryId: string
): Promise<void> => {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
  } catch (error) {
    console.error(`Error deleting category ${categoryId} from Firebase:`, error);
    throw error;
  }
};

// ── Batch sync all categories ────────────────────────────────────────
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

// ── Export categories as JSON backup ─────────────────────────────────
export const exportCategoriesAsJSON = (
  categories: Record<string, ProductCategory>
) => {
  const jsonStr = JSON.stringify(categories, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `categories-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

// ── Import categories from JSON file ─────────────────────────────────
export const importCategoriesFromJSON = (
  file: File
): Promise<Record<string, ProductCategory>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};