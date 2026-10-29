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
          background: 'linear-gradient(135deg, #F5F1FD 0%, #DFD8F3 100%)',
          border: '1.5px solid rgba(199, 187, 234, 0.85)',
          boxShadow: 'var(--shadow-clay)',
        };
      case 'inset':
        return {
          background: '#F4F1FA',
          border: '1.5px solid #DFD8F3',
          boxShadow: 'var(--shadow-clay-inset)',
        };
      case 'subtle':
        return {
          background: '#FDFCFF',
          border: '1.5px solid #ECE7FA',
          boxShadow: 'var(--shadow-clay-sm)',
        };
      case 'default':
      default:
        return {
          background: 'linear-gradient(160deg, #FFFFFF 0%, #F9F7FD 100%)',
          border: '1.5px solid rgba(223, 216, 243, 0.75)',
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
