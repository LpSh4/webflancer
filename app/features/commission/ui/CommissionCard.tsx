import { Link } from "react-router";

interface CommissionCardProps {
    commission: {
        id: string;
        title: string;
        description: string;
        commissionType: string;
        commissionProgress: string;
        budgetMin: number;
        budgetMax: number | null;
        createdAt: string;
    };
    viewerRole?: string; // Добавили роль!
}

export function CommissionCard({ commission, viewerRole }: CommissionCardProps) {
    const isPosted = commission.commissionProgress === "POSTED";
    const isCompleted = commission.commissionProgress === "DEVELOPMENT_COMPLETE";

    // Умный текст для ссылки
    const actionText = viewerRole === "CLIENT"
        ? "Управление →"
        : (isPosted ? "Откликнуться →" : "Подробности →");

    return (
        <div className={`bg-white border ${isPosted ? "border-slate-200 hover:border-slate-300 hover:shadow-md" : "border-slate-100 opacity-80"} rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between min-h-[180px]`}>
            <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {commission.commissionType.replace(/_/g, " ")}
                    </span>

                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isPosted ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            isCompleted ? "bg-slate-100 text-slate-500 border-slate-200" :
                                "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                        {isPosted ? "Ищет исполнителя" : isCompleted ? "Завершен" : "В работе"}
                    </span>
                </div>

                <div className="text-xs font-black text-slate-900 whitespace-nowrap mb-1">
                    {commission.budgetMax ? `${commission.budgetMin}–${commission.budgetMax} $` : `от ${commission.budgetMin} $`}
                </div>

                <h3 className="text-sm font-bold text-slate-900 tracking-tight line-clamp-1 hover:text-blue-600">
                    <Link to={`/commissions/${commission.id}`}>{commission.title}</Link>
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {commission.description}
                </p>
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50">
                <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(commission.createdAt).toLocaleDateString("ru-RU")}
                </span>
                <Link to={`/commissions/${commission.id}`} className="text-[11px] font-bold text-blue-600 hover:underline">
                    {actionText}
                </Link>
            </div>
        </div>
    );
}