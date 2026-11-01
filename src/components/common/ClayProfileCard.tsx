import React from 'react';
import { ClayAvatar } from './ClayAvatar';
import { ClayCard } from './ClayCard';
import { ClayBadge } from './ClayBadge';
import { ArrowRight } from 'lucide-react';

interface ClayProfileCardProps {
  name: string;
  role: 'student' | 'tutor' | 'admin';
  email: string;
  photoUrl?: string | null;
  detailLabel?: string;
  detailValue?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const ClayProfileCard: React.FC<ClayProfileCardProps> = ({
  name,
  role,
  email,
  photoUrl,
  detailLabel,
  detailValue,
  actionText,
  onAction,
  className = '',
}) => {
  const roleBadgeVariants = {
    student: 'blue' as const,
    tutor: 'purple' as const,
    admin: 'amber' as const,
  };

  const roleLabels = {
    student: 'Student • ವಿದ್ಯಾರ್ಥಿ',
    tutor: 'Academic Mentor • ಬೋಧಕ',
    admin: 'Administrator • ನಿರ್ವಾಹಕ',
  };

  return (
    <ClayCard className={`p-4 text-left ${className}`}>
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#EFEBF8]">
        <div className="flex items-center gap-3">
          <ClayAvatar name={name} photoUrl={photoUrl} size="lg" />
          <div>
            <h4 className="font-black text-sm text-[#1C1938] leading-tight">{name}</h4>
            <p className="text-[11px] text-[#686487] truncate max-w-[180px]">{email}</p>
          </div>
        </div>

        <ClayBadge variant={roleBadgeVariants[role]} size="sm">
          {roleLabels[role]}
        </ClayBadge>
      </div>

      {(detailLabel || actionText) && (
        <div className="pt-3 flex items-center justify-between text-xs">
          {detailLabel && (
            <div>
              <span className="text-[#686487] block text-[10px]">{detailLabel}</span>
              <strong className="text-[#1C1938] font-bold text-xs">{detailValue}</strong>
            </div>
          )}

          {actionText && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-button-primary active:scale-95 transition-all cursor-pointer ml-auto"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </ClayCard>
  );
};
