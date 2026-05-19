import { Link } from "react-router";

interface CommissionCardProps {
    commission: {
        id: string;
        title: string;
        description: string;
        commissionType: string;
        budgetMin: number;
        budgetMax: number | null; // Поменяли с ? на | null, чтобы типы сошлись с базой/стейтом
        createdAt: string;
    };
}

export function CommissionCard({ commission }: CommissionCardProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all hover:shadow-md flex flex-col justify-between min-h-[180px]">
            <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {commission.commissionType.replace("_", " ")}
                    </span>
                    <span className="text-xs font-black text-slate-900 whitespace-nowrap">
                        {commission.budgetMax ? `${commission.budgetMin}–${commission.budgetMax} $` : `от ${commission.budgetMin} $`}
                    </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 tracking-tight line-clamp-1 hover:text-slate-700">
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
                <Link to={`/commissions/${commission.id}`} className="text-[11px] font-bold text-slate-900 hover:underline">
                    Посмотреть заказ →
                </Link>
            </div>
        </div>
    );
}