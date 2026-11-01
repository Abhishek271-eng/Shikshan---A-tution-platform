import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ClayBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  kannadaTitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: string;
}

export const ClayBottomSheet: React.FC<ClayBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  kannadaTitle,
  children,
  footer,
  maxHeight = 'max-h-[85vh]',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg bg-white rounded-t-[36px] sm:rounded-[36px] border border-[#E5DFF8] shadow-2xl overflow-hidden flex flex-col ${maxHeight} animate-slide-up relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle on Mobile */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-[#DFD8F3]" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFEBF8] flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-black text-[#1C1938] tracking-tight">
              {title}
            </h3>
            {kannadaTitle && (
              <p className="text-xs text-[#686487] font-kannada">
                {kannadaTitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-[#FAF9FE] border border-[#E5DFF8] hover:bg-[#EDE9FE] flex items-center justify-center text-[#686487] hover:text-[#1C1938] transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#EFEBF8] bg-[#FAF9FE] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
