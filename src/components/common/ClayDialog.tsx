import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ClayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const ClayDialog: React.FC<ClayDialogProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1938]/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidth} rounded-[28px] bg-white border border-[#E5DFF8] shadow-2xl p-6 relative overflow-hidden animate-scaleIn`}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && <h3 className="text-base font-black text-[#1C1938] leading-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-[#686487] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-[#FAF9FE] border border-[#E5DFF8] text-[#686487] hover:text-[#DC2626] hover:bg-[#FEE2E2] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div>{children}</div>
      </div>
    </div>
  );
};
