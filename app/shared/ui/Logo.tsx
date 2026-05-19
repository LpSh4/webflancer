interface LogoProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    showSubtitle?: boolean;
}

export function Logo({ size = "md", className = "", showSubtitle = true }: LogoProps) {
    const sizeConfig = {
        sm: {
            icon: "w-6 h-6 rounded-md",
            svg: "w-3.5 h-3.5",
            text: "text-lg",
            sub: "text-[8px]"
        },
        md: {
            icon: "w-8 h-8 rounded-lg",
            svg: "w-4 h-4",
            text: "text-xl",
            sub: "text-[10px]"
        },
        lg: {
            icon: "w-10 h-10 rounded-xl",
            svg: "w-5 h-5",
            text: "text-2xl",
            sub: "text-xs"
        },
    };

    const styles = sizeConfig[size];

    return (
        <div className={`flex flex-col items-center select-none ${className}`}>
            {/* Иконка в стиле строгой геометрии */}
            <div className={`${styles.icon} bg-slate-900 flex items-center justify-center mb-2`}>
                <svg className={`${styles.svg} text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>

            {/* Текст — чистый графит */}
            <span className={`${styles.text} font-bold tracking-tight text-slate-900`}>
                Webflancer
            </span>

            {/* Подзаголовок */}
            {showSubtitle && (
                <p className={`${styles.sub} text-slate-400 font-medium tracking-wider mt-0.5`}>
                    Freelance Ecosystem
                </p>
            )}
        </div>
    );
}