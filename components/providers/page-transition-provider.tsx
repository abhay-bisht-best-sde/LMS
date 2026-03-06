"use client";

interface PageTransitionProviderProps {
  children: React.ReactNode;
}

export const PageTransitionProvider = ({
  children,
}: PageTransitionProviderProps) => {
  return <>{children}</>;
};
