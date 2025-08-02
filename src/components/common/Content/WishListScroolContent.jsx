import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../../../styles/dashboard/dashboard.css';
import '../../../styles/common/typography.css';
import '../../../styles/dashboard/wishlistscrollcontent.css';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '../Icon/Icon';

const WishListScrollContent = ({ wishlists = [], onSelectWishlist, onCreateWishlist, onShareWishlist }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Sample data if no wishlists provided
  const sampleWishlists = wishlists.length > 0 ? wishlists : [];

  // Fixed card width for mobile, adjust for desktop
  const cardWidth = 300;
  const isMobile = window.innerWidth <= 512;

  // Scroll to index (only for mobile)
  const scrollToIndex = useCallback((index) => {
    if (!scrollContainerRef.current || !isMobile) return;

    const container = scrollContainerRef.current;
    const targetScrollLeft = index * cardWidth;
    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth',
    });
    setCurrentIndex(index);
  }, [cardWidth, isMobile]);

  // Drag handlers (only for mobile) with reduced sensitivity
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
    const walk = (x - startX) * 1.0; // Reduced from 1.5 to 1.0 for easier swipe
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isMobile, isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    if (!isMobile || !isDragging) return;
    setIsDragging(false);
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollLeft = container.scrollLeft;
        const nearestIndex = Math.round(scrollLeft / cardWidth);
        const clampedIndex = Math.max(0, Math.min(nearestIndex, sampleWishlists.length - 1));
        scrollToIndex(clampedIndex);
      }
    }, 100);
  }, [isMobile, isDragging, scrollToIndex, sampleWishlists.length, cardWidth]);

  // Touch handlers (only for mobile) with reduced sensitivity
  const handleTouchStart = useCallback((e) => {
    if (!isMobile || !scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  }, [isMobile]);

  const handleTouchMove = useCallback((e) => {
    if (!isMobile || !isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 0.8; // Reduced from 1.2 to 0.8 for easier swipe
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isMobile, isDragging, startX, scrollLeft]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  // Scroll listener (only for mobile)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isMobile) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollLeft = container.scrollLeft;
          const containerWidth = container.clientWidth;
          const scrollWidth = container.scrollWidth;
          
          // Check if we're close to the end of the scroll area
          const isNearEnd = scrollLeft + containerWidth >= scrollWidth - 20;
          
          if (isNearEnd) {
            // If near the end, set the last item as active
            setCurrentIndex(sampleWishlists.length - 1);
          } else {
            // Otherwise use the standard calculation
            const newIndex = Math.round(scrollLeft / cardWidth);
            const clampedIndex = Math.max(0, Math.min(newIndex, sampleWishlists.length - 1));
            setCurrentIndex(clampedIndex);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(() => scrollToIndex(0), 100);

    return () => container.removeEventListener('scroll', handleScroll);
  }, [isMobile, scrollToIndex, sampleWishlists.length, cardWidth]);

  // Keyboard navigation (optional for desktop)
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

  return (
    <div className="wishlist-scroll-content">
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
                onClick={() => {
                  // Navigate directly to wishlist details page without token check
                  navigate(`/wishlist/${wishlist.id}`);
                  
                  // Call the original onSelectWishlist handler if provided
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
                <div className="card-footer">
                    <button
                      className="share-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareWishlist && onShareWishlist(wishlist);
                      }}
                      aria-label={`Share ${wishlist.title} wishlist`}
                    >
                      <Icon name="share" size={24} />
                    </button>
                  </div>
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