import type { UserProfile } from "../shared/model";
import { Star } from "lucide-react";
import { UserAvatar } from "~/shared/ui/UserAvatar"; // Подключаем наш аватар

interface ProfileInfoCardProps {
    user: UserProfile;
    completedCount: number; // 🔥 Принимаем реальное число сделок
}

export function ProfileInfoCard({ user, completedCount }: ProfileInfoCardProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">

            {/* 🔥 Интегрируем наш умный аватар вместо старого div */}
            <UserAvatar
                name={user.displayedName || user.name || "U"}
                src={(user as any).profilePicture}
                lastOnline={(user as any).lastOnline}
                showStatus={true}
                size={80}
                className="mb-4"
            />

            <h2 className="text-base font-black text-slate-900 tracking-tight">{user.displayedName}</h2>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                {user.role === "DEVELOPER" ? "Разработчик / Исполнитель" : "Заказчик / Клиент"}
            </p>

            <div className="w-full h-px bg-slate-100 my-4" />

            <div className="grid grid-cols-2 w-full text-left gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Сделки</div>
                    {/* 🔥 Выводим посчитанные сделки с правильным склонением */}
                    <div className="font-bold text-slate-900 mt-0.5">
                        {completedCount} {getNoun(completedCount, 'успешная', 'успешные', 'успешных')}
                    </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Рейтинг</div>
                    <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {user.averageRating ?? "0.00"}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Хелпер для красивого склонения слов (1 успешная, 2 успешные, 5 успешных)
function getNoun(number: number, one: string, two: string, five: string) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) return five;
    n %= 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
}