import { useLoaderData, useActionData, useNavigation, Form, Link } from "react-router";
import type { Route } from "./+types/view";
import { getUser } from "~/shared/utils/auth.server";
import { api } from "~/shared/utils/api.server";
import { ArrowLeft, Clock, DollarSign, Send, CheckCircle2 } from "lucide-react";
import { Input } from "~/shared/ui/Input";
import { Button } from "~/shared/ui/Button";

// Интерфейсы на базе твоего бэкенда
interface Commission {
    id: string;
    title: string;
    description: string;
    commissionType: string;
    commissionProgress: string;
    budgetMin: number;
    budgetMax: number | null;
    deadline: string | null;
    createdAt: string;
    clientId: string;
    client?: { displayedName: string };
}

interface Bid {
    id: string;
    bidStatus: "created" | "accepted" | "rejected" | "withdrawn";
    commissionId: string;
    developerId: string;
    createdAt: string;
    // TODO: Друг должен добавить эти поля на бэкенд
    price?: number;
    days?: number;
    comment?: string;
    developer?: { displayedName: string };
}

export async function loader({ params, request }: Route.LoaderArgs) {
    const { user } = await getUser(request);
    const cookieHeader = request.headers.get("Cookie");

    try {
        // 1. Получаем инфу о заказе
        const commissionRes = await api.get(`/commissions/view/${params.id}`, {
            headers: { Cookie: cookieHeader }
        });
        const commission: Commission = commissionRes.data;

        // 2. Получаем все отклики к этому заказу
        const bidsRes = await api.get(`/bids/commission/${params.id}`, {
            headers: { Cookie: cookieHeader }
        });
        const bids: Bid[] = bidsRes.data;

        return { user, commission, bids };
    } catch (error: any) {
        console.error("Ошибка загрузки заказа:", error.message);
        throw new Response("Заказ не найден", { status: 404 });
    }
}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent"); // 'create_bid' или 'accept_bid'
    const cookieHeader = request.headers.get("Cookie");

    if (intent === "create_bid") {
        try {
            // TODO: Когда друг добавит поля, отправлять их в body. Пока шлем пустой объект
            await api.post(`/bids/create/${params.id}`, {}, {
                headers: { Cookie: cookieHeader }
            });
            return { success: true, message: "Отклик успешно отправлен!" };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Ошибка отправки отклика." };
        }
    }

    if (intent === "accept_bid") {
        const bidId = formData.get("bidId");
        try {
            await api.post(`/bids/accept/${bidId}`, {}, {
                headers: { Cookie: cookieHeader }
            });
            return { success: true, message: "Исполнитель выбран! Заказ переведен в работу." };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Не удалось принять ставку." };
        }
    }

    return null;
}

export default function CommissionViewPage() {
    const { user, commission, bids } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    // Проверяем, оставлял ли этот разработчик уже ставку
    const hasMyBid = bids.some(b => b.developerId === user.id);
    const isMyCommission = commission.clientId === user.id;

    return (
        <div className="flex-1 bg-slate-50 min-h-screen py-10">
            <div className="max-w-6xl mx-auto px-6">

                <Link to="/commissions" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Назад к заказам
                </Link>

                {actionData?.success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> {actionData.message}
                    </div>
                )}
                {actionData?.success === false && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                        ❌ Ошибка: {actionData.message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* ЛЕВАЯ СТОРОНА: Проект + Отклики */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Карточка ТЗ */}
                        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-900" />

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                                    {commission.commissionType.replace(/_/g, " ")}
                                </span>
                                <div className="text-right">
                                    <div className="text-lg font-black text-slate-900">
                                        {commission.budgetMax ? `${commission.budgetMin} — ${commission.budgetMax} $` : `от ${commission.budgetMin} $`}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Бюджет проекта</div>
                                </div>
                            </div>

                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-snug mb-3">
                                {commission.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium pb-6 border-b border-slate-100">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(commission.createdAt).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long' })}
                                </div>
                                <span>•</span>
                                <div>
                                    Заказчик: <Link to={`/users/${commission.clientId}`} className="text-slate-900 font-bold hover:underline">{commission.client?.displayedName || "Скрыт"}</Link>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Описание задачи:</h3>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                                    {commission.description || "Заказчик не оставил подробного описания."}
                                </p>
                            </div>
                        </div>

                        {/* Секция Откликов (Bids) */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between px-1">
                                <span>Отклики исполнителей</span>
                                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">{bids.length}</span>
                            </h2>

                            {bids.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400 text-sm">
                                    На этот проект пока нет откликов.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bids.map((bid) => (
                                        <div key={bid.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900">
                                                        <Link to={`/users/${bid.developerId}`} className="hover:underline">
                                                            {bid.developer?.displayedName || "Разработчик"}
                                                        </Link>
                                                    </h4>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Отклик от {new Date(bid.createdAt).toLocaleDateString("ru-RU")}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-slate-900">{bid.price || "—"} $</div>
                                                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">{bid.days || "—"} дн.</div>
                                                </div>
                                            </div>

                                            {bid.comment && (
                                                <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                                                    {bid.comment}
                                                </p>
                                            )}

                                            {/* Кнопка "Принять ставку" (Только для владельца заказа) */}
                                            {isMyCommission && bid.bidStatus !== "accepted" && (
                                                <Form method="post" className="mt-4 pt-3 border-t border-slate-100">
                                                    <input type="hidden" name="intent" value="accept_bid" />
                                                    <input type="hidden" name="bidId" value={bid.id} />
                                                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                                                        Выбрать исполнителем
                                                    </Button>
                                                </Form>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ПРАВАЯ СТОРОНА: Форма подачи отклика */}
                    <div className="sticky top-20 space-y-4">
                        {user.role === "DEVELOPER" ? (
                            hasMyBid ? (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center shadow-sm">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                                    <h3 className="text-sm font-bold text-emerald-900">Вы уже откликнулись!</h3>
                                    <p className="text-xs text-emerald-700 mt-2">Ожидайте ответа от заказчика.</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                                        <Send className="w-4 h-4 text-slate-400" /> Предложить услуги
                                    </h3>

                                    <Form method="post" className="space-y-4">
                                        <input type="hidden" name="intent" value="create_bid" />

                                        <div className="grid grid-cols-2 gap-3">
                                            <Input label="Цена ($)" name="price" type="number" required defaultValue={commission.budgetMin} />
                                            <Input label="Срок (дни)" name="days" type="number" required defaultValue={7} />
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-slate-700 mb-1.5 ml-0.5 block">Сопроводительное письмо</label>
                                            <textarea name="comment" rows={5} required placeholder="Опишите ваш опыт и почему вы подходите для этой задачи..." className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all resize-none" />
                                        </div>

                                        <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                                            {isSubmitting ? "Отправка..." : "Отправить отклик"}
                                        </Button>
                                    </Form>
                                    <p className="text-[10px] text-slate-400 mt-4 text-center leading-relaxed">
                                        Ваш отклик будет виден только заказчику проекта.
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-600">
                                {isMyCommission ? (
                                    <>
                                        <h3 className="text-sm font-bold text-slate-900 mb-2">Это ваш заказ</h3>
                                        <p className="text-xs leading-relaxed">Вы можете просматривать отклики разработчиков в левой панели и выбрать лучшего исполнителя.</p>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-bold text-slate-900 mb-2">Доступ закрыт</h3>
                                        <p className="text-xs leading-relaxed">Только разработчики могут откликаться на проекты других клиентов.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}