import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full px-4 py-3 rounded-xl border text-ink placeholder:text-ink-muted",
            "bg-white transition-all duration-150 text-sm",
            "border-[#E0DDD6]",
            "focus:border-terracotta focus:ring-2 focus:ring-terracotta/20",
            error && "border-red-400 focus:border-red-500 focus:ring-red-200",
            "disabled:bg-sand disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
          {...props}
        />

        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
