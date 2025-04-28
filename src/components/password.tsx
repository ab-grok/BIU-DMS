"use client ";
import { cn } from "@/lib/utils";
import { Eye, EyeClosed } from "lucide-react";
import React, { useState } from "react";

export default function PasswordInput({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative flex">
      <input
        placeholder="Password"
        type={showPassword ? "text" : "password"}
        className={cn(
          "border-input file:text-bw placeholder:text-bw/40 selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-2xl border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 pe-11 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 h-1/2 w-6 translate-y-[55%] transition-all duration-1000"
      >
        {!showPassword ? (
          <Eye className="h-full w-full hover:scale-110" />
        ) : (
          <EyeClosed className="h-full w-full hover:scale-110" />
        )}
      </button>
    </div>
  );
}
