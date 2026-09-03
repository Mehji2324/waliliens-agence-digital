import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  id,
}) => {
  return (
    <div id={id} className={`mx-auto max-w-7xl px-6 sm:px-12 lg:px-24 ${className}`}>
      {children}
    </div>
  );
};
