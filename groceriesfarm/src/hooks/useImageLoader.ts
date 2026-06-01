import { useState, useEffect } from 'react';
import { getBase64Image, isBase64Image } from '@/services/imageStorageService';

/**
 * Hook to load base64 images from IndexedDB
 * 
 * Usage:
 * const imageUrl = useImageLoader(imageId);
 * 
 * If imageId is a base64 image ID (e.g., "img_123_abc"), it loads from IndexedDB.
 * If imageId is a URL, it returns it as-is.
 * If imageId is not found, it returns an empty string.
 */
export const useImageLoader = (imageId: string | undefined): string => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageId) {
      setImageUrl('');
      return;
    }

    // If it's already a base64 string, use it directly
    if (isBase64Image(imageId)) {
      setImageUrl(imageId);
      return;
    }

    // If it's a URL, use it directly
    if (imageId.startsWith('http://') || imageId.startsWith('https://')) {
      setImageUrl(imageId);
      return;
    }

    // Otherwise, try to load from IndexedDB (it's an image ID)
    setIsLoading(true);
    getBase64Image(imageId)
      .then((base64) => {
        setImageUrl(base64 || '');
      })
      .catch((error) => {
        console.error(`Error loading image ${imageId}:`, error);
        setImageUrl('');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [imageId]);

  return imageUrl;
};

/**
 * Hook to load multiple images at once
 * 
 * Usage:
 * const images = useImageLoaderBatch(['img_123_abc', 'img_456_def']);
 */
export const useImageLoaderBatch = (
  imageIds: (string | undefined)[]
): Record<string, string> => {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadImages = async () => {
      const result: Record<string, string> = {};

      for (const imageId of imageIds) {
        if (!imageId) continue;

        // If it's already a base64 string, use it directly
        if (isBase64Image(imageId)) {
          result[imageId] = imageId;
          continue;
        }

        // If it's a URL, use it directly
        if (imageId.startsWith('http://') || imageId.startsWith('https://')) {
          result[imageId] = imageId;
          continue;
        }

        // Otherwise, try to load from IndexedDB
        try {
          const base64 = await getBase64Image(imageId);
          result[imageId] = base64 || '';
        } catch (error) {
          console.error(`Error loading image ${imageId}:`, error);
          result[imageId] = '';
        }
      }

      setImages(result);
    };

    loadImages();
  }, [imageIds]);

  return images;
};
