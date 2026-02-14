/**
 * Modal Component - Reusable modal dialog
 */
import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, icon, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-72',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[32rem]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`bg-white rounded-2xl p-6 ${sizeClasses[size]} shadow-2xl relative animate-scaleIn`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {(title || icon) && (
          <div className="text-center mb-4">
            {icon && (
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                {icon}
              </div>
            )}
            {title && (
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

export default Modal;
