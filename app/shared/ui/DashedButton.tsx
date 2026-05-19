import React, {type ReactNode} from "react";

interface DashedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "success" | "danger" | "warning";
}

export function DashedButton({children, variant = "primary", className = "", ...props}: DashedButtonProps) {
    const colors = {
        primary: "border-blue-500/30 text-blue-400 hover:text-blue-300 hover:border-blue-500/50 hover:bg-blue-500/5",
        success: "border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/5",
        danger: "border-rose-500/30 text-rose-400 hover:text-rose-300 hover:border-rose-500/50 hover:bg-rose-500/5",
        warning: "border-amber-500/30 text-amber-400 hover:text-amber-300 hover:border-amber-500/50 hover:bg-amber-500/5",
    };

    return (
        <button
            {...props}
            className={`w-full flex items-center justify-center gap-2 py-3 md:py-4 border border-dashed rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer ${colors[variant]} ${className}`}
        >
            {children}
        </button>
    );
}