import React from 'react';

interface ClayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  variant?: 'default' | 'accent' | 'inset' | 'subtle';
  className?: string;
}

export const ClayCard: React.FC<ClayCardProps> = ({
  children,
  interactive = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'accent':
        return {
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          border: '1.5px solid rgba(191, 219, 254, 0.8)',
          boxShadow: 'var(--shadow-clay)',
        };
      case 'inset':
        return {
          background: '#F1F6FB',
          border: '1px solid #D9E6F2',
          boxShadow: 'var(--shadow-clay-inset)',
        };
      case 'subtle':
        return {
          background: '#FAFCFE',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-clay-sm)',
        };
      case 'default':
      default:
        return {
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F9FD 100%)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: 'var(--shadow-clay)',
        };
    }
  };

  return (
    <div
      className={`rounded-3xl p-6 transition-all duration-200 ${
        interactive ? 'clay-card-interactive cursor-pointer select-none' : ''
      } ${className}`}
      style={getVariantStyles()}
      {...props}
    >
      {children}
    </div>
  );
};
