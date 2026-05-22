import type { UserProfile } from "../shared/model";
import { Star } from "lucide-react";

interface ProfileInfoCardProps {
    user: UserProfile;
}

export function ProfileInfoCard({ user }: ProfileInfoCardProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-900 text-white flex items-center justify-center text-2xl font-black rounded-full shadow-inner mb-4">
                {user.displayedName ? user.displayedName.charAt(0).toUpperCase() : "U"}
            </div>

            <h2 className="text-base font-black text-slate-900 tracking-tight">{user.displayedName}</h2>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                {user.role === "DEVELOPER" ? "Разработчик / Исполнитель" : "Заказчик / Клиент"}
            </p>

            <div className="w-full h-px bg-slate-100 my-4" />

            <div className="grid grid-cols-2 w-full text-left gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Сделки</div>
                    <div className="font-bold text-slate-900 mt-0.5">12 успешных</div>
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