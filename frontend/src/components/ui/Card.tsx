import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-[28px] border border-violet-100/80 bg-white/75 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
