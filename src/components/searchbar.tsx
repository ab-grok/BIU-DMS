"use client ";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import React, { useState } from "react";

export default function SearchBar({
  className,
  type,
  onChange,
  value,
}: React.ComponentProps<"input">) {
  const [search, setSearch] = useState(false);
  function handleSearch() {}
  return (
    <div className="relative flex">
      <input
        placeholder="Firstname / lastname"
        type="text"
        onChange={onChange}
        className={cn(
          "border-bw file:text-bw placeholder:text-bw/40 selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-full border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring pe-11 focus-visible:ring-[3px] focus-visible:ring-blue-600/30",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
      />
      <button
        type="button"
        onClick={handleSearch}
        className="absolute top-0 right-0 flex h-full w-[2.5rem] items-center justify-center transition-all duration-1000"
      >
        <Search className="stroke-bw/70 size-[1rem] stroke-3" />
      </button>
    </div>
  );
}
