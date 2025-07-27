import { useTranslation } from 'react-i18next';
import '../../../styles/dashboard/dashboard.css';
import '../../../styles/common/typography.css'
import '../../../styles/dashboard/wishlistscrollcontent.css'
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '../Icon/Icon';

const WishListScrollContent = ({ wishlists = [], onSelectWishlist, onCreateWishlist }) => {
  const { t } = useTranslation();
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Sample data if no wishlists provided
  const sampleWishlists = wishlists.length > 0 ? wishlists : [
    { id: 1, title: 'BIRTHDAY WISHES', itemCount: 5, isActive: false },
    { id: 2, title: 'TRAVEL DREAMS', itemCount: 8, isActive: true },
    { id: 3, title: 'TECH GADGETS', itemCount: 3, isActive: false },
    { id: 4, title: 'BOOKS TO READ', itemCount: 12, isActive: false },
    { id: 5, title: 'FITNESS GOALS', itemCount: 6, isActive: false },
  ];

  // Fixed card width to match CSS (280px + 20px gap)
  const cardWidth = 300;
  const containerPadding = 20;

  // Throttled scroll position update
  const updateScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    
    // Simple calculation: divide scroll position by card width
    const newIndex = Math.round(scrollLeft / cardWidth);
    const clampedIndex = Math.max(0, Math.min(newIndex, sampleWishlists.length - 1));
    
    console.log('Scroll position:', scrollLeft, 'New index:', newIndex, 'Clamped:', clampedIndex);
    
    setCurrentIndex(clampedIndex);
  }, [sampleWishlists.length, cardWidth]);

  // Improved scroll to index with proper centering
  const scrollToIndex = useCallback((index) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    
    // Simple calculation: multiply index by card width
    const targetScrollLeft = index * cardWidth;
    
    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
    
    setCurrentIndex(index);
  }, [cardWidth]);

  // Optimized mouse drag handlers
  const handleMouseDown = useCallback((e) => {
    if (!scrollContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    
    // Prevent text selection during drag
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Reduced multiplier for smoother drag
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Snap to nearest card after drag ends
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollLeft = container.scrollLeft;
        const nearestIndex = Math.round(scrollLeft / cardWidth);
        const clampedIndex = Math.max(0, Math.min(nearestIndex, sampleWishlists.length - 1));
        
        scrollToIndex(clampedIndex);
      }
    }, 100);
  }, [isDragging, scrollToIndex, sampleWishlists.length, cardWidth]);

  // Touch handlers for mobile with improved sensitivity
  const handleTouchStart = useCallback((e) => {
    if (!scrollContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.2; // Optimized for touch
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp(); // Reuse mouse up logic
  }, [handleMouseUp]);

  // Throttled scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial position setup
    setTimeout(() => {
      scrollToIndex(0);
    }, 100);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [updateScrollPosition, scrollToIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        scrollToIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < sampleWishlists.length - 1) {
        e.preventDefault();
        scrollToIndex(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, sampleWishlists.length, scrollToIndex]);

  return (
    <div className="wishlist-scroll-content">
      {/* Header */}
      <div className="scroll-header">
        <h3 className="h2">{t('wishlists.title')}</h3>
      </div>

      <div className='scroll-content'>
        {/* Scrollable Cards Container */}
        <div className="scroll-container-wrapper">
          <div
            ref={scrollContainerRef}
            className={`scroll-container ${isDragging ? 'dragging' : ''}`}
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
                className={`wishlist-card-scroll ${index === currentIndex ? 'active' : ''}`}
                onClick={() => onSelectWishlist && onSelectWishlist(wishlist)}
                role="button"
                tabIndex={index === currentIndex ? 0 : -1}
                aria-label={`Wishlist: ${wishlist.title}, ${wishlist.itemCount} items`}
              >
                <div className="card-content">
                  <div className="card-body">
                    <h3 className="wishlist-title-scroll">{wishlist.title}</h3>
                    
                    {wishlist.itemCount && (
                      <p className="item-count">
                        {wishlist.itemCount} {t('wishlists.items', 'элемент')}
                      </p>
                    )}
                  </div>
                  
                  <div className="card-footer">
                    <div className="share-icon">
                      <Icon name="share" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
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
      </div>

      <div className='bottom-nav-spacer'></div>
    </div>
  );
};

export default WishListScrollContent;