import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ClaySectionHeaderProps {
  title: string;
  subtitle?: string;
  kannadaTitle?: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const ClaySectionHeader: React.FC<ClaySectionHeaderProps> = ({
  title,
  subtitle,
  kannadaTitle,
  icon: Icon,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex items-end justify-between gap-3 text-left ${className}`}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] text-[#7C3AED] flex items-center justify-center shadow-clay-sm flex-shrink-0">
            <Icon className="w-4 h-4 stroke-[2.2]" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-[#1C1938] tracking-tight">{title}</h3>
            {kannadaTitle && (
              <span className="text-[11px] font-bold text-[#7C3AED] font-kannada">({kannadaTitle})</span>
            )}
          </div>
          {subtitle && <p className="text-[11px] text-[#686487] mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 active:scale-95 transition-all cursor-pointer flex-shrink-0 pb-0.5"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
