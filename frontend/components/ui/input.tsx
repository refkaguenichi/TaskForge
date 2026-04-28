import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
