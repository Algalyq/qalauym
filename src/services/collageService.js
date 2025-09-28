import wishlistService from './wishlistService';
import { uploadImage } from './s3service';

// Функция calculateGrid больше не нужна, так как мы используем фиксированные макеты.
// const calculateGrid = (num) => { ... };

const createCollage = async (imageUrls) => {
  // Ограничиваемся первыми 6 изображениями для использования в фиксированных макетах
  const maxImages = 6; 
  const effectiveUrls = imageUrls.slice(0, maxImages);
  const num = effectiveUrls.length;

  if (num === 0) {
    return null;
  }

  // Размер коллажа (2x для 360x446)
  const collageWidth = 720;
  const collageHeight = 892;
  let positions = [];

  // --- ЛОГИКА ФИКСИРОВАННЫХ МАКЕТОВ (КАК ТРЕБОВАЛ ЗАКАЗЧИК) ---
  
  if (num === 1) {
    // 1 изображение: Полностью занимает холст
    positions = [
      { x: 0, y: 0, w: collageWidth, h: collageHeight } 
    ];
  } else if (num === 2) {
    // 2 изображения: Горизонтальный сплит (одно над другим)
    positions = [
      { x: 0, y: 0, w: collageWidth, h: collageHeight / 2 },
      { x: 0, y: collageHeight / 2, w: collageWidth, h: collageHeight / 2 }
    ];
  } else if (num === 3) {
    // 3 изображения: Два вертикальных (слева) и одно широкое (справа)
    // Разделение: 50% ширины для левой колонки, 50% для правой.
    const halfW = collageWidth / 2;
    positions = [
      // Левая колонка (2 вертикально)
      { x: 0, y: 0, w: halfW, h: collageHeight / 2 },
      { x: 0, y: collageHeight / 2, w: halfW, h: collageHeight / 2 },
      // Правая колонка (1 полное)
      { x: halfW, y: 0, w: halfW, h: collageHeight }
    ];
    // Примечание: Ваш запрос был "два вертикальных, одно горизонтальное". 
    // Я интерпретировал это как 2 ячейки слева (одна над другой) и 1 ячейка справа.
    
  } else if (num === 4) {
    // 4 изображения: Сетка 2x2
    const halfW = collageWidth / 2;
    const halfH = collageHeight / 2;
    positions = [
      { x: 0, y: 0, w: halfW, h: halfH },
      { x: halfW, y: 0, w: halfW, h: halfH },
      { x: 0, y: halfH, w: halfW, h: halfH },
      { x: halfW, y: halfH, w: halfW, h: halfH }
    ];
  } else if (num === 5) {
    // 5 изображений: 2x2 вверху + 1 широкое внизу
    const topH = collageHeight * 0.7; // 70% для верхних 4-х
    const bottomH = collageHeight - topH; // 30% для нижнего
    const halfW = collageWidth / 2;
    const halfTopH = topH / 2;
    positions = [
      // 4 ячейки вверху (2x2)
      { x: 0, y: 0, w: halfW, h: halfTopH },
      { x: halfW, y: 0, w: halfW, h: halfTopH },
      { x: 0, y: halfTopH, w: halfW, h: halfTopH },
      { x: halfW, y: halfTopH, w: halfW, h: halfTopH },
      // 1 широкое внизу
      { x: 0, y: topH, w: collageWidth, h: bottomH }
    ];
  } else if (num === 6) {
    // 6 изображений: Сетка 2x3 (2 колонки, 3 строки)
    const thirdH = collageHeight / 3;
    const halfW = collageWidth / 2;
    positions = [
      { x: 0, y: 0, w: halfW, h: thirdH },
      { x: halfW, y: 0, w: halfW, h: thirdH },
      { x: 0, y: thirdH, w: halfW, h: thirdH },
      { x: halfW, y: thirdH, w: halfW, h: thirdH },
      { x: 0, y: thirdH * 2, w: halfW, h: thirdH },
      { x: halfW, y: thirdH * 2, w: halfW, h: thirdH }
    ];
  }

  // --- Загрузка и отрисовка изображений (без изменений) ---

  const loadImage = (url) => {
    return new Promise((resolve) => { // Упростил до resolve, т.к. ошибка обрабатывается внутри
      const img = new Image(); 
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => {
        console.error(`Failed to load image: ${url}`, e);
        resolve(null); 
      };
      img.src = url;
    });
  };

  const images = await Promise.all(effectiveUrls.map(loadImage));

  const canvas = document.createElement('canvas');
  canvas.width = collageWidth;
  canvas.height = collageHeight;
  const ctx = canvas.getContext('2d');
  
  // Заливаем фон белым
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, collageWidth, collageHeight);

  images.forEach((img, i) => {
    if (!img) return; 

    const { x, y, w, h } = positions[i];
    
    // Использование drawCover для сохранения пропорций
    drawCover(ctx, img, x, y, w, h);
  });

  return new Promise((resolve) => {
    // Высокое качество JPEG
    canvas.toBlob(resolve, 'image/jpeg', 0.9); 
  });
};

/**
 * Отрисовывает изображение внутри ячейки, используя эффект "cover". (Без изменений)
 */
function drawCover(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;

    if (imgRatio > canvasRatio) {
        // Изображение шире ячейки: обрезаем по горизонтали
        srcW = img.height * canvasRatio;
        srcX = (img.width - srcW) / 2;
    } else {
        // Изображение выше ячейки: обрезаем по вертикали
        srcH = img.width / canvasRatio;
        srcY = (img.height - srcH) / 2;
    }
    
    // Отрисовка: img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
    ctx.drawImage(img, srcX, srcY, srcW, srcH, x, y, w, h);
}


// --- collageService (без изменений) ---
const collageService = {
  generateAndUpdateCollage: async (wishlistId, token) => {
    try {
      const imageUrls = await wishlistService.getWishlistImages(wishlistId, token);
      console.log("List of images:", imageUrls);
      // Ограничение до 6 изображений происходит внутри createCollage
      
      if (imageUrls.length === 0) {
        await wishlistService.updateWishlistImage(wishlistId, '', token);
        return;
      }

      const blob = await createCollage(imageUrls);
      if (!blob) {
        return;
      }

      const file = new File([blob], `collage_${wishlistId}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const uploadResult = await uploadImage({ file }, 'wish');
      // Убрал лишний console.log
      await wishlistService.updateWishlistImage(wishlistId, uploadResult.url, token);
      return uploadResult.url;
    } catch (error) {
      console.error('Error generating and updating collage:', error);
      throw error;
    }
  },
};

export default collageService;