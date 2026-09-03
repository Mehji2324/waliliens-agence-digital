import React from 'react';
import { PageContainer } from './PageContainer';

interface SectionProps {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  noContainer?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  id,
  className = '',
  containerClassName = '',
  children,
  noContainer = false,
}) => {
  return (
    <section id={id} className={`relative py-24 sm:py-28 ${className}`}>
      {noContainer ? (
        children
      ) : (
        <PageContainer className={containerClassName}>{children}</PageContainer>
      )}
    </section>
  );
};
