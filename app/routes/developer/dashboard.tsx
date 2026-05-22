import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/dashboard";
import { getUser } from "~/shared/utils/auth.server";
import { api } from "~/shared/utils/api.server";
import { Briefcase, CheckCircle2, Star, Clock } from "lucide-react";

interface Bid {
    id: string;
    bidStatus: "created" | "accepted" | "rejected" | "withdrawn";
    commissionId: string;
    developerId: string;
    createdAt: string;
    commission?: {
        title: string;
        budgetMin: number;
    };
}

export async function loader({ request }: Route.LoaderArgs) {
    const { user } = await getUser(request);
    const cookieHeader = request.headers.get("Cookie");

    let bids: Bid[] = [];

    try {
        // Запрашиваем все ставки этого разработчика из бэка
        const response = await api.get(`/bids/user/${user.id}`, {
            headers: { Cookie: cookieHeader }
        });
        bids = response.data;
    } catch (error) {
        console.error("[Developer Dashboard Loader] Ошибка:", error);
    }

    // Считаем реальную статистику на основе пришедших из базы данных
    const activeBids = bids.filter(b => b.bidStatus === "created").length;
    const acceptedBids = bids.filter(b => b.bidStatus === "accepted").length;

    return {
        user,
        bids,
        stats: {
            active: activeBids,
            completed: acceptedBids, // Принятые ставки, которые сейчас в работе
            rating: user.averageRating ? Number(user.averageRating).toFixed(2) : "0.00"
        }
    };
}

export default function DeveloperDashboard() {
    const { user, bids, stats } = useLoaderData<typeof loader>();

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Мой дашборд</h1>
                    <p className="text-xs text-slate-500 mt-1">Профиль разработчика: <span className="font-semibold">{user.displayedName}</span></p>
                </div>

                {/* Сетка реальной статистики */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Активные отклики</div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.active}</div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">В работе / Принято</div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.completed}</div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-500 rounded-lg">
                            <Star className="w-5 h-5 fill-amber-500" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Рейтинг биржи</div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.rating}</div>
                        </div>
                    </div>
                </div>

                {/* Список последних ставок */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
                        Последние отклики на заказы
                    </div>
                    {bids.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-xs">
                            Вы еще не оставляли откликов на проекты. <Link to="/commissions" className="text-blue-600 font-semibold hover:underline ml-1">Открыть ленту →</Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {bids.map((bid) => (
                                <div key={bid.id} className="p-4 flex justify-between items-center text-xs">
                                    <div>
                                        <div className="font-bold text-slate-900">Ставка на заказ #{bid.commissionId.substring(0, 8)}</div>
                                        <div className="text-slate-400 mt-1">Отправлено: {new Date(bid.createdAt).toLocaleDateString("ru-RU")}</div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        bid.bidStatus === "accepted" ? "bg-emerald-50 text-emerald-700" :
                                            bid.bidStatus === "created" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                                    }`}>
                                        {bid.bidStatus}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}