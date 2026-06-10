import { useState, useEffect } from "react";

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
    const [finalUrl, setFinalUrl] = useState<string>("");

    const initial = name?.trim().charAt(0).toUpperCase() || "?";
    const bgColor = getUserColor(name);

    const isOnline = lastOnline
        ? (Date.now() - new Date(lastOnline).getTime() < 1000 * 60 * 4)
        : false;

    // Формируем корректную ссылку
    const getFileUrl = () => {
        if (!src) return "";
        if (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) {
            return src;
        }
        const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';
        return `${apiUrl}${src}`;
    };

    // 🔥 ФИЧА: Валидация размеров картинки на клиенте
    useEffect(() => {
        const fileUrl = getFileUrl();
        if (!fileUrl) {
            setFinalUrl("");
            setIsError(false);
            return;
        }

        const img = new Image();
        img.src = fileUrl;

        img.onload = () => {
            // Если картинка больше 1000x1000, подменяем её на серую затычку-плейсхолдер
            if (img.width > 1000 || img.height > 1000) {
                console.warn(`[UserAvatar] Картинка ${img.width}x${img.height} превышает лимит 1000px. Ставим заглушку.`);
                setFinalUrl("https://png.pngtree.com/png-vector/20250512/ourmid/pngtree-default-avatar-profile-icon-gray-placeholder-vector-png-image_16213764.png");
            } else {
                setFinalUrl(fileUrl);
            }
            setIsError(false);
        };

        img.onerror = () => {
            setIsError(true);
        };
    }, [src]);

    return (
        <div className={`relative shrink-0 ${className}`} style={{width: size, height: size}}>
            <div
                className="w-full h-full flex items-center justify-center rounded-full overflow-hidden select-none font-bold text-white shadow-inner border border-slate-200/60"
                style={{
                    backgroundColor: isError || !src ? bgColor : "transparent",
                    fontSize: `${size * 0.38}px`,
                }}
            >
                {src && finalUrl && !isError ? (
                    <img
                        src={finalUrl}
                        alt={name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                        onError={() => setIsError(true)}
                    />
                ) : (
                    <span className="uppercase tracking-wider font-black">{initial}</span>
                )}
            </div>

            {showStatus && (
                <div
                    className={`absolute bottom-0 right-0 rounded-full border-2 border-white transition-all duration-500 ${
                        isOnline
                            ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                            : "bg-slate-400"
                    }`}
                    style={{
                        width: `${Math.max(size * 0.26, 9)}px`,
                        height: `${Math.max(size * 0.26, 9)}px`,
                    }}
                    title={isOnline ? "В сети" : "Офлайн"}
                />
            )}
        </div>
    );
}