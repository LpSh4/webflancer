import { useLoaderData, useFetcher, Link } from "react-router";
import type { Route } from "./+types/dashboard";
import { getUser } from "~/shared/utils/auth.server";
import { api } from "~/shared/utils/api.server";
import { Briefcase, Clock, Star, XCircle } from "lucide-react";
import { BID_STATUS_LABELS, getBidStatusStyles } from "~/features/commission/commission.constants";

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
        const response = await api.get(`/bids/user/${user.id}`, {
            headers: { Cookie: cookieHeader }
        });
        bids = response.data;
    } catch (error) {
        console.error("[Developer Dashboard Loader] Ошибка:", error);
    }

    return { user, bids };
}

export async function action({ request }: Route.ActionArgs) {
    const { user } = await getUser(request);
    const cookieHeader = request.headers.get("Cookie");
    const formData = await request.formData();
    const bidId = formData.get("bidId");

    if (!bidId) return { success: false, error: "Missing bidId" };

    try {
        await api.post(`/bids/withdraw/${bidId}`, {}, {
            headers: { Cookie: cookieHeader }
        });
        return { success: true };
    } catch (error: any) {
        console.error("[Developer Dashboard Action] Ошибка отзыва отклика:", error);
        return { success: false, error: error.response?.data?.message || "Не удалось отозвать отклик" };
    }
}

export default function DeveloperDashboard() {
    const { user, bids } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();

    // Оптимистичный расчет статистики с учетом фоновых изменений (через fetcher)
    const processedBids = bids.map(bid => {
        // Если прямо сейчас идет отправка формы для этого bidId, оптимистично меняем статус на withdrawn
        if (fetcher.formData && fetcher.formData.get("bidId") === bid.id) {
            return { ...bid, bidStatus: "withdrawn" as const };
        }
        return bid;
    });

    const activeBidsCount = processedBids.filter(b => b.bidStatus === "created").length;
    const acceptedBidsCount = processedBids.filter(b => b.bidStatus === "accepted").length;
    const ratingFormatted = user.averageRating ? Number(user.averageRating).toFixed(2) : "0.00";

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Мой дашборд</h1>
                    <p className="text-xs text-slate-500 mt-1">Профиль разработчика: <span className="font-semibold text-slate-700">{user.displayedName}</span></p>
                </div>

                {/* Сетка динамической статистики */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Активные отклики</div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{activeBidsCount}</div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">В работе / Выбран</div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{acceptedBidsCount}</div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-500 rounded-lg">
                            <Star className="w-5 h-5 fill-amber-500" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Рейтинг биржи</div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{ratingFormatted}</div>
                        </div>
                    </div>
                </div>

                {/* Список откликов */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
                        Последние отклики на заказы
                    </div>
                    {processedBids.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-xs">
                            Вы еще не оставляли откликов на проекты. <Link to="/commissions" className="text-blue-600 font-semibold hover:underline ml-1">Открыть ленту →</Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {processedBids.map((bid) => {
                                const statusLabel = BID_STATUS_LABELS[bid.bidStatus] || bid.bidStatus;
                                const statusStyles = getBidStatusStyles(bid.bidStatus);
                                const isSubmittingThis = fetcher.formData && fetcher.formData.get("bidId") === bid.id;

                                return (
                                    <div
                                        key={bid.id}
                                        className={`p-4 flex justify-between items-center text-xs hover:bg-slate-50/50 transition-all duration-300 ${
                                            bid.bidStatus === "withdrawn" ? "opacity-60 bg-slate-50/30" : ""
                                        }`}
                                    >
                                        <div>
                                            <Link
                                                to={`/commissions/${bid.commissionId}`}
                                                className="font-bold text-slate-900 hover:text-blue-600 hover:underline transition-colors"
                                            >
                                                Перейти к заказу "{bid.commission?.title ?? bid.commissionId}"
                                            </Link>
                                            <div className="text-slate-400 mt-1">
                                                Отправлено: {new Date(bid.createdAt).toLocaleDateString("ru-RU")}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-colors duration-300 ${statusStyles}`}>
                                                {statusLabel}
                                            </span>

                                            {/* Кнопка отзыва отображается только у активных ("created") откликов */}
                                            {bid.bidStatus === "created" && (
                                                <fetcher.Form method="post" className="inline-block">
                                                    <input type="hidden" name="bidId" value={bid.id} />
                                                    <button
                                                        type="submit"
                                                        disabled={!!isSubmittingThis}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 rounded-md transition-all group title='Отозвать отклик'"
                                                    >
                                                        <XCircle className="w-4 h-4 transition-transform group-hover:scale-105" />
                                                    </button>
                                                </fetcher.Form>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}