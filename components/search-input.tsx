"use client";

import qs from "query-string";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export const SearchInput = () => {
  const searchParams = useSearchParams();
  const currentTitle = searchParams.get("title") || "";

  const [value, setValue] = useState(currentTitle);
  const [hasUserInput, setHasUserInput] = useState(false);
  const debouncedValue = useDebounce(value);

  const router = useRouter();
  const pathname = usePathname();

  const currentCategoryId = searchParams.get("categoryId");

  useEffect(() => {
    setValue(currentTitle);
  }, [currentTitle]);

  useEffect(() => {
    if (!hasUserInput) {
      return;
    }

    const normalizedTitle = debouncedValue.trim();
    const url = qs.stringifyUrl({
      url: pathname,
      query: {
        categoryId: currentCategoryId,
        title: normalizedTitle,
      }
    }, { skipEmptyString: true, skipNull: true });

    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    if (url !== currentUrl) {
      router.replace(url);
    }
  }, [debouncedValue, currentCategoryId, router, pathname, searchParams, hasUserInput]);

  return (
    <div className="relative">
      <Search
        className="h-4 w-4 absolute top-3 left-3 text-slate-600"
      />
      <Input
        onChange={(e) => {
          setHasUserInput(true);
          setValue(e.target.value);
        }}
        value={value}
        className="w-full md:w-[300px] pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200"
        placeholder="Search for a course"
      />
    </div>
  );
};
