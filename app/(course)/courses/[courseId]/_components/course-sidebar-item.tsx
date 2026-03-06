"use client";

import { CheckCircle, Lock, PlayCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface CourseSidebarItemProps {
  label: string;
  id: string;
  isCompleted: boolean;
  courseId: string;
  isLocked: boolean;
};

export const CourseSidebarItem = ({
  label,
  id,
  isCompleted,
  courseId,
  isLocked,
}: CourseSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const Icon = isLocked ? Lock : (isCompleted ? CheckCircle : PlayCircle);
  const isActive = pathname?.includes(id);

  const onClick = () => {
    router.push(`/courses/${courseId}/chapters/${id}`);
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "flex w-full items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
        isActive && "text-sky-700 bg-sky-200/20 hover:bg-sky-200/20 hover:text-sky-700"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-x-2 py-4 pr-3">
        <Icon
          size={22}
          className={cn(
            "text-slate-500",
            isActive && "text-sky-700",
            isCompleted && !isActive && "text-emerald-700"
          )}
        />
        <span
          className={cn(
            "text-left leading-snug break-words",
            isCompleted && !isActive && "text-emerald-700"
          )}
        >
          {label}
        </span>
      </div>
      <div className={cn(
        "ml-auto h-full w-[3px] bg-sky-700 opacity-0 transition-all",
        isActive && "opacity-100",
      )} />
    </button>
  )
}
