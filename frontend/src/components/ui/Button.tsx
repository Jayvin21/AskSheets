import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-violet-600 text-white shadow-[0_14px_36px_rgba(124,58,237,0.26)] hover:bg-violet-700",
    secondary:
      "border border-violet-200/70 bg-white/70 text-violet-700 shadow-sm backdrop-blur-xl hover:bg-violet-50",
    ghost:
      "bg-transparent text-slate-500 hover:bg-violet-50 hover:text-violet-700",
    danger:
      "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
