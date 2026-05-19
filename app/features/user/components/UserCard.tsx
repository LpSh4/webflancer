import type {UserProfile} from "../model";
import {UserAvatar} from "~/shared/ui/UserAvatar";

interface UserCardProps {
    user: UserProfile;
}

// Словарь для перевода ролей
const ROLE_LABELS: Record<string, string> = {
    hr: "HR",
    teamlead: "Тимлид",
    intern: "Стажер",
};

export function UserCard({user}: UserCardProps) {
    // Получаем перевод или выводим роль как есть, если её нет в словаре
    const roleLabel = user?.role ? (ROLE_LABELS[user.role.toLowerCase()] || user.role) : "";

    return (
        <div
            className="group p-3 sm:p-4 glass-panel rounded-3xl flex items-center gap-4 border border-white/5 bg-white/2 hover:bg-white/5 transition-all duration-300 shadow-2xl">
            {/* Аватар с легким свечением при наведении на карточку */}
            <div className="relative">
                <div
                    className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"/>
                <UserAvatar
                    src={user?.avatar}
                    name={user?.displayName || user?.login}
                    lastOnline={user?.lastOnline}
                    showStatus={true}
                    size={42}
                />
            </div>

            <div className="flex flex-col min-w-0">
                <div className="text-sm font-semibold text-white truncate group-hover:text-blue-200 transition-colors">
                    {user?.displayName || user?.login}
                </div>

                {/* Роль: чуть уменьшили шрифт, добавили межбуквенное расстояние и полупрозрачность */}
                <div className="text-[9px] text-blue-400/80 font-bold uppercase tracking-[0.15em] leading-none mt-1">
                    {roleLabel}
                </div>
            </div>

            {/* Декоративный элемент — стрелочка, которая появляется при наведении */}
            <div
                className="ml-auto opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                </svg>
            </div>
        </div>
    );
}