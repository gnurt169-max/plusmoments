'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className={`relative w-full ${maxWidth} bg-[#FAF8F5] border border-champagne-dark/30 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10 transition-all duration-300 transform scale-100 opacity-100 max-h-[90vh] overflow-y-auto`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cửa sổ"
          className="absolute top-5 right-5 p-2 rounded-full text-charcoal-500 hover:text-charcoal-900 hover:bg-champagne/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {(title || subtitle) && (
          <div className="mb-6 pr-8">
            {title && (
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-charcoal-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-charcoal-500 mt-1 font-light">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
}

