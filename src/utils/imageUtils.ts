import { images } from '@/constants/images';

/**
 * Map to cache hash results for consistency
 */
const imageHashCache = new Map<string, string>();

/**
 * FNV-1a hash algorithm for consistent, well-distributed hashes
 * This ensures better distribution across the image array
 */
function fnv1aHash(str: string): number {
  let hash = 2166136261; // FNV offset basis (32-bit)
  
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)) >>> 0;
  }
  
  return hash >>> 0; // Convert to unsigned 32-bit integer
}

/**
 * Get a deterministic image for a community based on its ID
 * The same community ID will always return the same image
 * Images are distributed across the available pool without repetition within reasonable bounds
 * 
 * @param communityId - Unique community identifier
 * @returns Image URL from the images array
 */
export function getImageForCommunity(communityId: string): string {
  // Check cache first
  if (imageHashCache.has(communityId)) {
    return imageHashCache.get(communityId)!;
  }

  // Calculate hash and get image
  const hash = fnv1aHash(communityId);
  const index = hash % images.length;
  const imageUrl = images[index];

  // Cache the result
  imageHashCache.set(communityId, imageUrl);

  return imageUrl;
}

/**
 * Get multiple distinct images for community IDs
 * Useful for ensuring no two communities in a list get the same image when possible
 * 
 * @param communityIds - Array of community identifiers
 * @returns Array of image URLs, distributed to minimize repetition
 */
export function getDistinctImagesForCommunities(communityIds: string[]): Map<string, string> {
  const result = new Map<string, string>();
  const usedImages = new Set<string>();
  const remainingImages = [...images];

  // First pass: assign images, trying to avoid repeats
  for (const id of communityIds) {
    const hash = fnv1aHash(id);
    let index = hash % remainingImages.length;
    let imageUrl = remainingImages[index];

    // If this image was already used in this batch, try nearby indices
    let attempts = 0;
    while (usedImages.has(imageUrl) && attempts < remainingImages.length) {
      index = (index + 1) % remainingImages.length;
      imageUrl = remainingImages[index];
      attempts++;
    }

    result.set(id, imageUrl);
    usedImages.add(imageUrl);
  }

  return result;
}

/**
 * Reset the image hash cache
 * Useful for testing or when you want to clear cached mappings
 */
export function clearImageCache(): void {
  imageHashCache.clear();
}
