import React, { useEffect } from 'react';
import { MdCheckCircle, MdError, MdInfo, MdWarning, MdClose } from 'react-icons/md';

// Toast component with auto-disappear functionality
const Toast = ({ 
  message, 
  type = 'success', // success, error, info, warning
  onClose,
  duration = 3000 // milliseconds before auto-close
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  // Select icon based on toast type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <MdCheckCircle className="text-white text-xl" />;
      case 'error':
        return <MdError className="text-white text-xl" />;
      case 'warning':
        return <MdWarning className="text-white text-xl" />;
      case 'info':
      default:
        return <MdInfo className="text-white text-xl" />;
    }
  };
  
  // Select background color based on toast type
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };
  
  return (
    <div className={`fixed bottom-4 right-4 flex items-center p-4 mb-4 rounded-lg shadow-lg ${getBgColor()} text-white animate-slide-up`}
         role="alert">
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
        {getIcon()}
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button 
        type="button" 
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 hover:bg-black hover:bg-opacity-25"
        aria-label="Close"
        onClick={onClose}
      >
        <MdClose className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
