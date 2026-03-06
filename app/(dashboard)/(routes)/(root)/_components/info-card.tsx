import { LucideIcon } from "lucide-react";

import { IconBadge } from "@/components/icon-badge"
import { MotionCard } from "./motion-card";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  numberOfItems: number;
  variant?: "default" | "success";
  label: string;
  icon: LucideIcon;
}

export const InfoCard = ({
  variant,
  icon: Icon,
  numberOfItems,
  label,
}: InfoCardProps) => {
  const isSuccess = variant === "success";

  return (
    <MotionCard
      className={cn(
        "rounded-xl border p-4 sm:p-5 flex items-center gap-x-3 shadow-sm",
        isSuccess
          ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-white"
          : "border-sky-200 bg-gradient-to-r from-sky-50 to-white"
      )}
    >
      <IconBadge
        variant={variant}
        icon={Icon}
      />
      <div className="min-w-0">
        <p className="font-semibold text-slate-900 leading-tight">
          {label}
        </p>
        <p className={cn(
          "text-sm mt-1",
          isSuccess ? "text-emerald-700/80" : "text-sky-700/80"
        )}>
          {numberOfItems} {numberOfItems === 1 ? "Course" : "Courses"}
        </p>
      </div>
    </MotionCard>
  )
}
