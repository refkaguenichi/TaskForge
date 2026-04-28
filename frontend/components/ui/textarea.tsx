import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-text",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
