import {useState} from "react";

export function getUserColor(name: string) {
    if (!name) return "#3b82f6";
    const colors = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#f43f5e', '#06b6d4', '#eab308', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

interface UserAvatarProps {
    name: string;
    src?: string | null;
    size?: number;
    className?: string;
    lastOnline?: string | Date | null;
    showStatus?: boolean;
}

export function UserAvatar({name, src, size = 40, className = "", lastOnline, showStatus = false}: UserAvatarProps) {
    const [isError, setIsError] = useState(false);
    const initial = name?.trim().charAt(0).toUpperCase() || "?";
    const bgColor = getUserColor(name);

    const isOnline = lastOnline
        ? (Date.now() - new Date(lastOnline).getTime() < 1000 * 60 * 4)
        : false;

    const getFileUrl = () => {
        if (!src) return "";
        // Если это blob, base64 или фулл ссылка — отдаем как есть
        if (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) {
            return src;
        }
        const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';
        return `${apiUrl}${src}`;
    };

    const fileUrl = getFileUrl();

    return (
        <div className={`relative shrink-0 ${className}`} style={{width: size, height: size}}>
            <div
                className="w-full h-full flex items-center justify-center rounded-full overflow-hidden select-none font-bold text-white shadow-inner"
                style={{
                    backgroundColor: isError || !src ? bgColor : "transparent",
                    fontSize: `${size * 0.4}px`,
                }}
            >
                {src && !isError ? (
                    <img
                        src={fileUrl}
                        alt={name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                        onError={() => setIsError(true)}
                    />
                ) : (
                    <span className="uppercase tracking-wider">{initial}</span>
                )}
            </div>

            {showStatus && (
                <div
                    className={`absolute bottom-0 right-0 rounded-full border-2 border-[#0f172a] transition-all duration-500 ${
                        isOnline
                            ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                            : "bg-slate-600"
                    }`}
                    style={{
                        width: `${Math.max(size * 0.28, 8)}px`,
                        height: `${Math.max(size * 0.28, 8)}px`,
                    }}
                    title={isOnline ? "В сети" : "Офлайн"}
                />
            )}
        </div>
    );
}