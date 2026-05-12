/**
 * Firebase Storage Service
 * Handles image uploads to Firebase Storage
 * Stores URLs in Firestore (keeps documents lean)
 */

import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import app from '@/lib/firebase';

const storage = getStorage(app);

/**
 * Upload a base64 image to Firebase Storage
 * @param base64String - The base64 image string (e.g., "data:image/jpeg;base64,...")
 * @param fileName - Name for the file (e.g., "product-123.jpg")
 * @returns The download URL of the uploaded image
 */
export const uploadImageToStorage = async (
  base64String: string,
  fileName: string
): Promise<string> => {
  try {
    // Generate unique file path
    const timestamp = Date.now();
    const filePath = `images/${timestamp}-${fileName}`;
    const imageRef = ref(storage, filePath);

    // Upload the base64 string
    await uploadString(imageRef, base64String, 'data_url');

    // Get the download URL
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    throw error;
  }
};

/**
 * Delete an image from Firebase Storage
 * @param downloadURL - The download URL of the image to delete
 */
export const deleteImageFromStorage = async (downloadURL: string): Promise<void> => {
  try {
    // Extract the file path from the URL
    const decodedURL = decodeURIComponent(downloadURL);
    const filePath = decodedURL.split('/o/')[1]?.split('?')[0];
    
    if (!filePath) {
      console.warn('Could not extract file path from URL:', downloadURL);
      return;
    }

    const imageRef = ref(storage, filePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image from storage:', error);
    // Don't throw - deletion failure shouldn't break the app
  }
};
