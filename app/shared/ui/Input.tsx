import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    wrapperClassName?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, className = "", wrapperClassName = "", error, ...props }, ref) => {
        return (
            <div className={`w-full flex flex-col ${wrapperClassName}`}>
                {label && (
                    <label className="text-xs font-medium text-slate-700 mb-1.5 ml-0.5">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`w-full bg-white border ${
                        error
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                            : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/5"
                    } px-3 py-2 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all ${className}`}
                    {...props}
                />
                {error && (
                    <span className="text-red-500 text-xs font-medium mt-1.5 ml-0.5 block">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";