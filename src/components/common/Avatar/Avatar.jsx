import React from 'react';
import PropTypes from 'prop-types';
import './Avatar.css';

/**
 * A reusable avatar component that displays either an image or a placeholder with initials
 */
const Avatar = ({ 
  src, 
  alt, 
  username, 
  size = 'medium', 
  onClick,
  className = '' 
}) => {
  // Get the first character of the username for placeholder
  const initial = username ? username.charAt(0).toUpperCase() : '?';

  // Determine size class
  const sizeClass = `avatar-${size}`;
  
  return (
    <div 
      className={`avatar ${sizeClass} ${className}`} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt || username || 'Avatar'} 
          className="avatar-image" 
        />
      ) : (
        <div className="avatar-placeholder">
          {initial}
        </div>
      )}
    </div>
  );
};

Avatar.propTypes = {
  /** URL of the avatar image */
  src: PropTypes.string,
  /** Alt text for the avatar image */
  alt: PropTypes.string,
  /** Username for generating initials in placeholder */
  username: PropTypes.string,
  /** Size of avatar: 'small', 'medium', 'large' */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Optional click handler */
  onClick: PropTypes.func,
  /** Additional CSS classes */
  className: PropTypes.string
};

export default Avatar;
