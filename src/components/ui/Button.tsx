import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "gradient-kueski text-white shadow-md hover:opacity-95 active:scale-[0.98]",
  secondary:
    "bg-white text-kueski-800 border border-kueski-200 hover:bg-kueski-50",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
};

export function Button({
  variant = "primary",
  children,
  fullWidth,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
