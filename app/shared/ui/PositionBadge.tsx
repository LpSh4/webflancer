interface PositionBadgeProps {
    name: string;
    color: string;
    size?: number;
    className?: string;
}

export function PositionBadge({ name, color, size = 9, className = "" }: PositionBadgeProps) {
    return (
        <span
            className={`font-black uppercase tracking-wider border rounded-lg whitespace-nowrap ${className}`}
            style={{
                color: color,
                backgroundColor: `${color}15`,
                borderColor: `${color}30`,
                fontSize: `${size}px`,
                padding: `${size * 0.4}px ${size * 0.8}px`
            }}
        >
            {name}
        </span>
    );
}