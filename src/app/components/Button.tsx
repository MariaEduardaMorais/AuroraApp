import * as React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "danger" | "soft";
    size?: "default" | "sm" | "lg" | "icon";
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-stone-800 text-stone-50 hover:bg-stone-800/90": variant === "default",
          "border border-stone-200 bg-transparent hover:bg-stone-100 text-stone-900": variant === "outline",
          "hover:bg-stone-100 text-stone-900": variant === "ghost",
          "bg-red-50 text-red-600 hover:bg-red-100": variant === "danger",
          "bg-teal-100 text-teal-900 hover:bg-teal-200": variant === "soft",
          "h-10 px-4 py-2": size === "default",
          "h-9 rounded-lg px-3": size === "sm",
          "h-12 rounded-xl px-8": size === "lg",
          "h-10 w-10": size === "icon",
        },
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
