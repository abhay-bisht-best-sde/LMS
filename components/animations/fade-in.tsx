"use client";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export const FadeIn = ({
  children,
  className,
}: FadeInProps) => {
  return <div className={className}>{children}</div>;
};
