import React from 'react';
import { Clock, ShieldCheck, XCircle, AlertCircle } from 'lucide-react';
import { TutorApplicationStatus } from '../../types';

interface StatusBadgeProps {
  status: TutorApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          label: 'Approved & Verified',
          kannada: 'ಅಂಗೀಕರಿಸಲಾಗಿದೆ',
          icon: ShieldCheck,
          bg: '#ECFDF5',
          text: '#065F46',
          border: '#A7F3D0',
        };
      case 'rejected':
        return {
          label: 'Application Closed',
          kannada: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
          icon: XCircle,
          bg: '#FEF2F2',
          text: '#991B1B',
          border: '#FECACA',
        };
      case 'needs_info':
        return {
          label: 'Action Required',
          kannada: 'ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ',
          icon: AlertCircle,
          bg: '#F0F9FF',
          text: '#0369A1',
          border: '#BAE6FD',
        };
      case 'pending_review':
      default:
        return {
          label: 'Pending Manual Review',
          kannada: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ',
          icon: Clock,
          bg: '#FFFBEB',
          text: '#92400E',
          border: '#FDE68A',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  }[size];

  return (
    <div
      className={`inline-flex items-center font-bold rounded-full border shadow-sm ${sizeClasses}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{config.label}</span>
    </div>
  );
};
