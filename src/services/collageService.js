import wishlistService from './wishlistService';
import { uploadImage } from './s3service';

// Cache for loaded images to avoid re-downloading
const imageCache = new Map();

// Pre-calculated layout templates for better performance
const LAYOUT_TEMPLATES = {
  1: [{ x: 0, y: 0, w: 720, h: 892 }],
  2: [
    { x: 0, y: 0, w: 720, h: 446 },
    { x: 0, y: 446, w: 720, h: 446 }
  ],
  3: [
    { x: 0, y: 0, w: 360, h: 446 },
    { x: 0, y: 446, w: 360, h: 446 },
    { x: 360, y: 0, w: 360, h: 892 }
  ],
  4: [
    { x: 0, y: 0, w: 360, h: 446 },
    { x: 360, y: 0, w: 360, h: 446 },
    { x: 0, y: 446, w: 360, h: 446 },
    { x: 360, y: 446, w: 360, h: 446 }
  ],
  5: [
    { x: 0, y: 0, w: 360, h: 312 },
    { x: 360, y: 0, w: 360, h: 312 },
    { x: 0, y: 312, w: 360, h: 312 },
    { x: 360, y: 312, w: 360, h: 312 },
    { x: 0, y: 624, w: 720, h: 268 }
  ],
  6: [
    { x: 0, y: 0, w: 360, h: 297 },
    { x: 360, y: 0, w: 360, h: 297 },
    { x: 0, y: 297, w: 360, h: 297 },
    { x: 360, y: 297, w: 360, h: 297 },
    { x: 0, y: 594, w: 360, h: 298 },
    { x: 360, y: 594, w: 360, h: 298 }
  ]
};

// Canvas pool for reusing canvas elements
const canvasPool = [];

const getCanvasFromPool = () => {
  if (canvasPool.length > 0) {
    return canvasPool.pop();
  }
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 892;
  return canvas;
};

const returnCanvasToPool = (canvas) => {
  // Clear the canvas for reuse
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvasPool.push(canvas);
};

// Optimized image loading with cache and timeout


// Batch image loading for better performance
const loadImagesInBatches = async (urls, batchSize = 2) => {
  const results = [];
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    console.log(`   Loading batch: ${i} to ${i + batchSize - 1}`);
    
    const batchPromises = batch.map((url, batchIndex) => 
      loadImage(url, i + batchIndex)
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
};

// Optimized drawCover function
function drawCover(ctx, img, x, y, w, h) {
  if (!img) return;
  
  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;
  
  let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;

  if (imgRatio > canvasRatio) {
    srcW = img.height * canvasRatio;
    srcX = (img.width - srcW) / 2;
  } else {
    srcH = img.width / canvasRatio;
    srcY = (img.height - srcH) / 2;
  }
  
  ctx.drawImage(img, srcX, srcY, srcW, srcH, x, y, w, h);
}

const createCollage = async (imageUrls) => {
  const maxImages = 6;
  const effectiveUrls = imageUrls.slice(0, maxImages);
  const num = effectiveUrls.length;

  console.log('🎨 Creating collage with', num, 'images:', effectiveUrls);

  if (num === 0) {
    console.log('❌ No images provided for collage');
    return null;
  }

  // Get positions from pre-calculated templates
  const positions = LAYOUT_TEMPLATES[num];
  if (!positions) {
    console.error(`No layout template for ${num} images`);
    return null;
  }

  console.log('📥 Loading images...');
  
  // Load images with batching for better performance
  const images = await loadImagesInBatches(effectiveUrls);
  
  console.log('✅ Images loaded:', images.map((img, i) => 
    img ? `Image ${i}: ${img.width}x${img.height}` : `Image ${i}: FAILED`
  ));

  const canvas = getCanvasFromPool();
  const ctx = canvas.getContext('2d');
  
  // Fill background with white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  console.log('🎯 Drawing images on canvas...');

  // Draw images
  let drawnCount = 0;
  images.forEach((img, i) => {
    if (!img) {
      console.log(`❌ Skipping image ${i} - failed to load`);
      return;
    }

    const { x, y, w, h } = positions[i];
    console.log(`   Drawing image ${i} at position:`, { x, y, w, h }, `size: ${img.width}x${img.height}`);
    
    try {
      drawCover(ctx, img, x, y, w, h);
      drawnCount++;
    } catch (drawError) {
      console.error(`❌ Error drawing image ${i}:`, drawError);
    }
  });

  console.log(`✅ Successfully drew ${drawnCount}/${num} images`);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      console.log('📦 Canvas to blob:', blob ? `size: ${blob.size} bytes` : 'FAILED');
      returnCanvasToPool(canvas);
      resolve(blob);
    }, 'image/jpeg', 0.85);
  });
};

// Enhanced image loading with better error handling
const loadImage = (url, index) => {
  return new Promise((resolve) => {
    // Check cache first
    if (imageCache.has(url)) {
      console.log(`   Image ${index} from cache: ${url}`);
      resolve(imageCache.get(url));
      return;
    }

    console.log(`   Loading image ${index}: ${url}`);
    const img = new Image();
    const timeoutId = setTimeout(() => {
      console.warn(`⏰ Image ${index} load timeout: ${url}`);
      resolve(null);
    }, 10000); // 10 second timeout

    img.crossOrigin = 'anonymous';
    img.onload = () => {
      clearTimeout(timeoutId);
      console.log(`   ✅ Image ${index} loaded: ${img.width}x${img.height}`);
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = (e) => {
      clearTimeout(timeoutId);
      console.error(`   ❌ Image ${index} failed to load: ${url}`, e);
      resolve(null);
    };
    img.src = url;
  });
};

// Alternative collage generation methods
const collageService = {
  // Original method with optimizations
  generateAndUpdateCollage: async (wishlistId, token) => {
    try {
      const imageUrls = await wishlistService.getWishlistImages(wishlistId, token);
      
      if (imageUrls.length === 0) {
        await wishlistService.updateWishlistImage(wishlistId, '', token);
        return null;
      }

      const blob = await createCollage(imageUrls);
      if (!blob) {
        return null;
      }

      const file = new File([blob], `collage_${wishlistId}_${Date.now()}.jpg`, { 
        type: 'image/jpeg' 
      });
      
      const uploadResult = await uploadImage({ file }, 'wish');
      await wishlistService.updateWishlistImage(wishlistId, uploadResult.url, token);
      
      return uploadResult.url;
    } catch (error) {
      console.error('Error generating and updating collage:', error);
      throw error;
    }
  },

  // Async method - doesn't wait for completion
  generateCollageAsync: async (wishlistId, token) => {
    try {
      // Fire and forget - don't wait for completion
      setTimeout(async () => {
        try {
          await collageService.generateAndUpdateCollage(wishlistId, token);
        } catch (error) {
          console.warn('Async collage generation failed:', error);
        }
      }, 0);
      
      return { status: 'queued' };
    } catch (error) {
      console.error('Error queuing collage generation:', error);
      throw error;
    }
  },

  // Low priority generation for better UX
  generateCollageLowPriority: async (wishlistId, token) => {
    if ('requestIdleCallback' in window) {
      return new Promise((resolve) => {
        requestIdleCallback(async () => {
          try {
            const result = await collageService.generateAndUpdateCollage(wishlistId, token);
            resolve(result);
          } catch (error) {
            console.warn('Low priority collage generation failed:', error);
            resolve(null);
          }
        });
      });
    } else {
      // Fallback: delay execution
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            const result = await collageService.generateAndUpdateCollage(wishlistId, token);
            resolve(result);
          } catch (error) {
            console.warn('Low priority collage generation failed:', error);
            resolve(null);
          }
        }, 1000);
      });
    }
  },

  // Batch processing for multiple wishlists
  generateCollagesInBatch: async (wishlistIds, token) => {
    const results = [];
    
    for (let i = 0; i < wishlistIds.length; i++) {
      try {
        // Add delay between processing to prevent blocking
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const result = await collageService.generateCollageLowPriority(wishlistIds[i], token);
        results.push({ wishlistId: wishlistIds[i], success: !!result });
      } catch (error) {
        console.error(`Failed to generate collage for wishlist ${wishlistIds[i]}:`, error);
        results.push({ wishlistId: wishlistIds[i], success: false });
      }
    }
    
    return results;
  },

  // Clear cache (useful when images are updated)
  clearCache: () => {
    imageCache.clear();
  },

  // Preload images for a wishlist
  preloadWishlistImages: async (wishlistId, token) => {
    try {
      const imageUrls = await wishlistService.getWishlistImages(wishlistId, token);
      await loadImagesInBatches(imageUrls.slice(0, 6));
    } catch (error) {
      console.warn('Failed to preload wishlist images:', error);
    }
  }
};

export default collageService;