import Image from "next/image";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export const BrandLogo = ({
  className,
  iconClassName,
  textClassName,
}: BrandLogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/genomeLogo.svg"
        alt="Genome.Do logo"
        width={36}
        height={36}
        className={cn("h-9 w-9", iconClassName)}
        priority
      />
      <span className={cn("text-xl font-semibold tracking-tight", textClassName)}>
        Genome.Do
      </span>
    </div>
  );
};
