import React from 'react';
import { PageContainer } from './PageContainer';

interface SectionProps {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  noContainer?: boolean;
  /** Override the default vertical padding entirely (e.g. "pt-8 pb-16") */
  paddingClassName?: string;
}

export const Section: React.FC<SectionProps> = ({
  id,
  className = '',
  containerClassName = '',
  children,
  noContainer = false,
  paddingClassName,
}) => {
  return (
    <section id={id} className={`relative ${paddingClassName ?? 'py-24 sm:py-28'} ${className}`}>
      {noContainer ? (
        children
      ) : (
        <PageContainer className={containerClassName}>{children}</PageContainer>
      )}
    </section>
  );
};
