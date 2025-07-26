import React from 'react';
import PropTypes from 'prop-types';

// Import SVG files as URLs
import HomeIcon from '../../../assets/icons/home.svg';
import ListIcon from '../../../assets/icons/list.svg';
import PlusIcon from '../../../assets/icons/plus.svg';
import ProfileIcon from '../../../assets/icons/profile.svg';
import EditIcon from '../../../assets/icons/edit.svg';
// Map icon names to their corresponding SVG URLs
const iconUrls = {
  home: HomeIcon,
  list: ListIcon,
  plus: PlusIcon,
  profile: ProfileIcon,
  edit: EditIcon,
};

const Icon = ({ name, size = 24, className = '', style = {}, ...props }) => {
  const iconUrl = iconUrls[name];
  
  if (!iconUrl) {
    console.warn(`Icon '${name}' not found`);
    return null;
  }
  
  const iconStyle = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'inline-block',
    ...style
  };

  return (
    <img 
      src={iconUrl} 
      alt={`${name} icon`}
      className={`icon ${className}`.trim()}
      style={iconStyle}
      aria-hidden="true"
      {...props}
    />
  );
};

Icon.propTypes = {
  /** Name of the icon (home, list, plus, profile) */
  name: PropTypes.oneOf(Object.keys(iconUrls)).isRequired,
  /** Size of the icon in pixels */
  size: PropTypes.number,
  /** Additional class names */
  className: PropTypes.string,
  /** Inline styles */
  style: PropTypes.object
};

export default Icon;
