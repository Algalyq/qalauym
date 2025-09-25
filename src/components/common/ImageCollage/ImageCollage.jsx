import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import './ImageCollage.css';

/**
 * A responsive, justified image gallery component
 * Arranges images in rows with consistent height while filling the width
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
const ImageCollage = ({ 
  images, 
  targetRowHeight = 200, 
  containerPadding = 0,
  imagePadding = 4,
  maxRows = Infinity,
  enableLazyLoading = true,
  onImageClick
}) => {
  const [rows, setRows] = useState([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);
  
  // Calculate aspect ratio for each image
  const getAspectRatio = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img.width / img.height);
      };
      img.onerror = () => {
        // Default aspect ratio if image fails to load
        resolve(1.5);
      };
      img.src = imageUrl;
    });
  };

  // Calculate layout based on container width and image dimensions
  const calculateLayout = useCallback(async () => {
    if (!containerRef.current || !images || images.length === 0) return;
    
    const availableWidth = containerRef.current.offsetWidth - (containerPadding * 2);
    setContainerWidth(availableWidth);
    
    // Stores temporary row data during calculation
    let currentRow = [];
    let currentRowAspectRatioSum = 0;
    let rowsData = [];
    
    // Get aspect ratios for all images
    const aspectRatios = await Promise.all(
      images.map((image) => getAspectRatio(image))
    );
    
    // Build rows
    for (let i = 0; i < images.length; i++) {
      const aspectRatio = aspectRatios[i];
      
      // Add image to the current row
      currentRow.push({
        url: images[i],
        aspectRatio,
        originalIndex: i
      });
      
      currentRowAspectRatioSum += aspectRatio;
      
      // Calculate how wide this row would be at target height
      const rowWidth = currentRowAspectRatioSum * targetRowHeight;
      
      // If adding this image would make the row too wide, finalize the row
      const isLastImage = i === images.length - 1;
      if (rowWidth >= availableWidth || isLastImage) {
        // Calculate the actual height this row will have
        let rowHeight = targetRowHeight;
        
        if (!isLastImage || rowWidth > availableWidth) {
          // Adjust height to fit the row perfectly within available width
          rowHeight = availableWidth / currentRowAspectRatioSum;
        }
        
        // Calculate widths for each image in the row
        const rowImages = currentRow.map((img) => ({
          ...img,
          width: img.aspectRatio * rowHeight,
          height: rowHeight
        }));
        
        // Add row to rows data
        rowsData.push({
          images: rowImages,
          height: rowHeight
        });
        
        // Reset for next row
        currentRow = [];
        currentRowAspectRatioSum = 0;
        
        // Limit the number of rows if specified
        if (rowsData.length >= maxRows) break;
      }
    }
    
    setRows(rowsData);
  }, [images, targetRowHeight, containerPadding, imagePadding, maxRows]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      calculateLayout();
    };

    // Initial calculation
    calculateLayout();

    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateLayout]);

  // Observer for lazy loading
  const setupIntersectionObserver = useCallback(() => {
    if (!enableLazyLoading) return;
    
    const observerOptions = {
      rootMargin: '200px 0px', // Start loading when images get within 200px
      threshold: 0.01
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, observerOptions);
    
    // Observe all images with data-src attribute
    document.querySelectorAll('.collage-image[data-src]').forEach(img => {
      observer.observe(img);
    });
    
    return observer;
  }, [enableLazyLoading]);

  // Set up lazy loading after rows are rendered
  useEffect(() => {
    if (rows.length > 0) {
      const observer = setupIntersectionObserver();
      
      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }
  }, [rows, setupIntersectionObserver]);

  // Handle image click
  const handleImageClick = (image, index) => {
    if (onImageClick) {
      onImageClick(image, index);
    }
  };

  return (
    <div 
      className="image-collage-container" 
      ref={containerRef}
      style={{ padding: containerPadding }}
    >
      {rows.map((row, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="collage-row"
          style={{ height: row.height }}
        >
          {row.images.map((image) => (
            <div
              key={`image-${image.originalIndex}`}
              className="collage-image-wrapper"
              style={{
                width: image.width,
                height: image.height,
                padding: imagePadding
              }}
              onClick={() => handleImageClick(image.url, image.originalIndex)}
            >
              {enableLazyLoading ? (
                <img
                  className="collage-image"
                  data-src={image.url}
                  src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                  alt={`Collage image ${image.originalIndex + 1}`}
                />
              ) : (
                <img
                  className="collage-image loaded"
                  src={image.url}
                  alt={`Collage image ${image.originalIndex + 1}`}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

ImageCollage.propTypes = {
  /** Array of image URLs */
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  /** Target height for rows in pixels */
  targetRowHeight: PropTypes.number,
  /** Padding around the container in pixels */
  containerPadding: PropTypes.number,
  /** Padding between images in pixels */
  imagePadding: PropTypes.number,
  /** Maximum number of rows to display */
  maxRows: PropTypes.number,
  /** Enable lazy loading of images */
  enableLazyLoading: PropTypes.bool,
  /** Callback when an image is clicked */
  onImageClick: PropTypes.func
};

export default ImageCollage;
