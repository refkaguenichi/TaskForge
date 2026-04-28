import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
  {
    variants: {
      variant: {
        default: "bg-[var(--surface-dark)] text-white hover:opacity-92",
        accent: "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]",
        outline: "border border-[var(--line)] bg-white/85 text-[var(--foreground)] hover:bg-white",
        ghost: "text-[var(--foreground)] hover:bg-[#f4eee5]",
        soft: "bg-[#fff8ef] text-[var(--foreground)] hover:bg-[#fff3e3]",
        danger: "bg-[#fff1f1] text-[#b42318] hover:bg-[#ffe4e4]",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        icon: "h-10 w-10 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
