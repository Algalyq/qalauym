import wishlistService from './wishlistService';
import { uploadImage } from './s3service';

const createCollage = async (imageUrls) => {
  const maxImages = 4; // Limit to 4 images for a simple 2x2 collage
  const effectiveUrls = imageUrls.slice(0, maxImages);
  const num = effectiveUrls.length;

  if (num === 0) {
    return null;
  }

  const collageWidth = 800;
  const collageHeight = 800;
  let positions = [];

  if (num === 1) {
    positions = [{ x: 0, y: 0, w: 800, h: 800 }];
  } else if (num === 2) {
    positions = [
      { x: 0, y: 0, w: 400, h: 800 },
      { x: 400, y: 0, w: 400, h: 800 }
    ];
  } else if (num === 3) {
    positions = [
      { x: 0, y: 0, w: 400, h: 400 },
      { x: 400, y: 0, w: 400, h: 400 },
      { x: 0, y: 400, w: 800, h: 400 }
    ];
  } else if (num === 4) {
    positions = [
      { x: 0, y: 0, w: 400, h: 400 },
      { x: 400, y: 0, w: 400, h: 400 },
      { x: 0, y: 400, w: 400, h: 400 },
      { x: 400, y: 400, w: 400, h: 400 }
    ];
  }

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  const images = await Promise.all(effectiveUrls.map(loadImage));

  const canvas = document.createElement('canvas');
  canvas.width = collageWidth;
  canvas.height = collageHeight;
  const ctx = canvas.getContext('2d');

  images.forEach((img, i) => {
    const { x, y, w, h } = positions[i];
    ctx.drawImage(img, x, y, w, h);
  });

  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.8);
  });
};

const collageService = {
  generateAndUpdateCollage: async (wishlistId, token) => {
    try {
      const imageUrls = await wishlistService.getWishlistImages(wishlistId, token);

      if (imageUrls.length === 0) {
        // Update to empty image URL if no images
        await wishlistService.updateWishlistImage(wishlistId, '', token);
        return;
      }

      const blob = await createCollage(imageUrls);
      if (!blob) {
        return;
      }

      const file = new File([blob], `collage_${wishlistId}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const uploadResult = await uploadImage({ file }, 'wish');

      await wishlistService.updateWishlistImage(wishlistId, uploadResult.url, token);
      return uploadResult.url;
    } catch (error) {
      console.error('Error generating and updating collage:', error);
      throw error;
    }
  },
};

export default collageService;