/**
 * Image Storage Service
 * Stores images as data URLs directly in Firestore
 * Simple and works without Firebase Storage configuration
 */

/**
 * Compress a base64 image to reduce size
 * @param base64String - The base64 image string
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param quality - Quality 0-1 (default 0.7)
 * @returns Compressed base64 string
 */
export const compressImage = (
  base64String: string,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64String;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get the image type from the original base64 string
      const imageType = base64String.includes('png') ? 'image/png' : 'image/jpeg';
      const compressedBase64 = canvas.toDataURL(imageType, quality);
      
      resolve(compressedBase64);
    };
    
    img.onerror = () => {
      reject(new Error('Could not load image'));
    };
  });
};
