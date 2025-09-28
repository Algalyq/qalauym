import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../../../styles/dashboard/dashboard.css';
import '../../../styles/common/typography.css';
import '../../../styles/dashboard/wishlistscrollcontent.css';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '../Icon/Icon';
import { MdClose } from 'react-icons/md'; // Import the close icon

const WishListScrollContent = ({ wishlists = [], onSelectWishlist, onCreateWishlist, onShareWishlist }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // 1. NEW STATE: State to manage the full-screen share preview
  const [isFullscreenPreviewOpen, setIsFullscreenPreviewOpen] = useState(false);

  // Use the provided wishlists or an empty array
  const sampleWishlists = wishlists.length > 0 ? wishlists : [];
  
  // Get the currently active wishlist object
  const activeWishlist = sampleWishlists[currentIndex];

  const isMobile = window.innerWidth <= 512;

  // --- Scroll Logic (Unchanged) ---

  const scrollToIndex = useCallback((index) => {
    if (!scrollContainerRef.current || !isMobile) return;

    const container = scrollContainerRef.current;
    const cardElement = container.children[index];
    if (cardElement) {
        // Calculate the scroll position to center the card
        const cardRect = cardElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const scrollPosition = cardRect.left - containerRect.left + container.scrollLeft - (containerRect.width / 2) + (cardRect.width / 2);
        
        container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth',
        });
        setCurrentIndex(index);
    }
  }, [isMobile]);

  const handleMouseDown = useCallback((e) => {
    if (!isMobile || !scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    e.preventDefault();
  }, [isMobile]);

  const handleMouseMove = useCallback((e) => {
    if (!isMobile || !isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.0;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isMobile, isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    if (!isMobile || !isDragging) return;
    setIsDragging(false);
  }, [isMobile, isDragging]);

  const handleTouchStart = useCallback((e) => {
    if (!isMobile || !scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  }, [isMobile]);

  const handleTouchMove = useCallback((e) => {
    if (!isMobile || !isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 0.8;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isMobile, isDragging, startX, scrollLeft]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isMobile) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const containerRect = container.getBoundingClientRect();
          const containerCenterX = containerRect.left + containerRect.width / 2;

          let closestCardIndex = 0;
          let minDistance = Infinity;

          Array.from(container.children).forEach((child, index) => {
            const cardRect = child.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(cardCenterX - containerCenterX);

            if (distance < minDistance) {
              minDistance = distance;
              closestCardIndex = index;
            }
          });

          setCurrentIndex(closestCardIndex);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(() => scrollToIndex(0), 100);

    return () => container.removeEventListener('scroll', handleScroll);
  }, [isMobile, scrollToIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isMobile && e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        scrollToIndex(currentIndex - 1);
      } else if (isMobile && e.key === 'ArrowRight' && currentIndex < sampleWishlists.length - 1) {
        e.preventDefault();
        scrollToIndex(currentIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, sampleWishlists.length, scrollToIndex, isMobile]);

  // --- NEW: Share Preview Handlers ---

  // 2. Modified handler to open the preview
  const handleShareClick = (e, wishlist) => {
    e.stopPropagation();
    // Only open the preview if there's an active wishlist
    if (wishlist) {
        setIsFullscreenPreviewOpen(true);
    }
  };

  // 3. Final share handler called from within the fullscreen preview
  const handleFinalShare = (wishlist) => {
      setIsFullscreenPreviewOpen(false); // Close preview
      if (onShareWishlist) {
          onShareWishlist(wishlist); // Execute the actual share logic
      }
  };

  // 4. NEW: Fullscreen Preview Component
  const FullscreenSharePreview = ({ wishlist }) => (
    <div className="fullscreen-share-preview-overlay">
      <div className="fullscreen-preview-header">
          {/* Close Button */}
          <button 
              onClick={() => setIsFullscreenPreviewOpen(false)} 
              className="preview-close-btn"
              aria-label={t('common.close') || 'Close'}
          >
              <MdClose size={28} />
          </button>
          {/* Custom Title */}
          <h2 className="preview-title">{t('wish.fullScreenTitle') || 'Wishlist Share Preview'}</h2>
          
          {/* Share Button (Optional, can be placed at bottom too) */}
          <button 
            onClick={() => handleFinalShare(wishlist)} 
            className="preview-share-btn"
          >
             {t('common.share') || 'Share'}
          </button>
      </div>

      <div className="preview-content-container">
          {/* The replicated wishlist card content */}
          <div 
              className="wishlist-card-scroll active fullscreen-card"
              style={{
                  backgroundImage: `image-set(url(${wishlist.imageUrl}) 1x, url(${wishlist.imageUrl}) 2x)`,
                  WebkitBackgroundImage: `-webkit-image-set(url(${wishlist.imageUrl}) 1x, url(${wishlist.imageUrl}) 2x)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  imageRendering: 'auto',
              }}
          >
              <div className="card-content">
                  <div className="card-body">
                      <h3 className="wishlist-title-scroll">{wishlist.title}</h3>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );


  // --- RENDER ---
  return (
    <div className="wishlist-scroll-content">
      {isFullscreenPreviewOpen && activeWishlist && (
          <FullscreenSharePreview wishlist={activeWishlist} />
      )}

      <div className="scroll-header">
        <h3 className="h2">{t('wishlists.title')}</h3>
      </div>

      <div className="scroll-content">
        <div className="scroll-container-wrapper">
          <div
            ref={scrollContainerRef}
            className={`scroll-container ${isDragging && isMobile ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="region"
            aria-label="Wishlist carousel"
          >
            {sampleWishlists.map((wishlist, index) => (
              <div
                key={wishlist.id}
                className={`wishlist-card-scroll ${index === currentIndex ? 'active' : ''} ${
                  !isMobile && index === currentIndex ? 'focused' : ''
                }`}
                style={{
                  backgroundImage: `image-set(url(${wishlist.imageUrl}) 1x, url(${wishlist.imageUrl}) 2x)`,
                  WebkitBackgroundImage: `-webkit-image-set(url(${wishlist.imageUrl}) 1x, url(${wishlist.imageUrl}) 2x)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  imageRendering: 'auto',
                }}
                onClick={() => {
                  navigate(`/wishlist/${wishlist.id}`);
                  if (onSelectWishlist) onSelectWishlist(wishlist);
                }}
                tabIndex={index === currentIndex ? 0 : -1}
                aria-label={`Wishlist: ${wishlist.title}, ${wishlist.itemCount} items`}
              >
                <div className="card-content">
                  <div className="card-body">
                    <h3 className="wishlist-title-scroll">{wishlist.title}</h3>
                  </div>
                </div>
                {/* <div className="card-footer">
                    <button
                      className="share-icon"
                      onClick={(e) => handleShareClick(e, wishlist)} // Use the new handler
                      aria-label={`Share ${wishlist.title} wishlist`}
                    >
                      <Icon name="instagram" size={36} />
                    </button>
                  </div> */}
              </div>
            ))}
          </div>
        </div>

        {isMobile && (
          <div className="pagination-dots">
            {sampleWishlists.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => scrollToIndex(index)}
                aria-label={`Go to wishlist ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishListScrollContent;