import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "danger" | "secondary" | "ghost" | "outline";
}

export function Button({
                           variant = "primary",
                           className = "",
                           children,
                           ...props
                       }: ButtonProps) {
    const baseStyles = "px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center";

    const variants = {
        // Контрастный черный/темно-серый элемент
        primary: "bg-slate-900 hover:bg-slate-800 text-white border border-slate-900",
        // Чистый аккуратный красный без неонового свечения
        danger: "bg-red-600 hover:bg-red-700 text-white",
        // Светло-серый минимализм
        secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-transparent",
        // Полностью прозрачный с легким серым ховером
        ghost: "bg-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900",
        // Тонкая серая рамка
        outline: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}