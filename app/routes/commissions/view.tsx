import { useLoaderData, useActionData, useNavigation, Form, Link } from "react-router";
import type { Route } from "./+types/view";
import { useState } from "react";
import { getUser } from "~/shared/utils/auth.server";
import { api } from "~/shared/utils/api.server";
import { ArrowLeft, Clock, Send, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { Input } from "~/shared/ui/Input";
import { Button } from "~/shared/ui/Button";
import { Modal } from "~/shared/ui/Modal";

// ... Интерфейсы Commission и Bid, а также loader и action оставляем из предыдущего сообщения ...
export async function loader({ params, request }: Route.LoaderArgs) {
    const { user } = await getUser(request);
    const cookieHeader = request.headers.get("Cookie");

    try {
        const commissionRes = await api.get(`/commissions/view/${params.id}`, { headers: { Cookie: cookieHeader } });
        const bidsRes = await api.get(`/bids/commission/${params.id}`, { headers: { Cookie: cookieHeader } });
        return { user, commission: commissionRes.data, bids: bidsRes.data };
    } catch (error: any) {
        throw new Response("Заказ не найден", { status: 404 });
    }
}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const cookieHeader = request.headers.get("Cookie");

    if (intent === "create_bid") {
        try {
            await api.post(`/bids/create/${params.id}`, {}, { headers: { Cookie: cookieHeader } });
            return { success: true, message: "Отклик успешно отправлен!" };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Ошибка отправки." };
        }
    }

    if (intent === "accept_bid") {
        try {
            await api.post(`/bids/accept/${formData.get("bidId")}`, {}, { headers: { Cookie: cookieHeader } });
            return { success: true, message: "Исполнитель выбран! Заказ переведен в работу." };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Ошибка." };
        }
    }
    return null;
}

export default function CommissionViewPage() {
    const { user, commission, bids } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [isBidModalOpen, setIsBidModalOpen] = useState(false);

    const hasMyBid = bids.some((b: any) => b.developerId === user.id);
    const isMyCommission = commission.clientId === user.id;
    const isAvailable = commission.commissionProgress === "POSTED";

    // Ищем принятую ставку
    const acceptedBid = bids.find((b: any) => b.bidStatus === "accepted");
    // Проверяем, имеет ли текущий юзер доступ к чату
    const canAccessWorkspace = isMyCommission || (acceptedBid && acceptedBid.developerId === user.id);

    return (
        <div className="flex-1 bg-slate-50 min-h-screen py-10">
            <div className="max-w-4xl mx-auto px-6">

                <div className="flex justify-between items-center mb-6">
                    <Link to="/commissions" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Назад к заказам
                    </Link>

                    {user.role === "DEVELOPER" && !hasMyBid && !isMyCommission && isAvailable && (
                        <Button onClick={() => setIsBidModalOpen(true)} className="gap-2 shadow-sm">
                            <Send className="w-3.5 h-3.5" /> Откликнуться
                        </Button>
                    )}
                </div>

                {/* ПЛАШКА РАБОЧЕЙ ОБЛАСТИ (Если заказ в работе) */}
                {!isAvailable && canAccessWorkspace && (
                    <div className="mb-6 p-6 bg-white rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-200 ring-1 ring-emerald-50">
                        <div>
                            <h2 className="text-slate-900 font-bold text-lg flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Проект в работе
                            </h2>
                            <p className="text-slate-500 text-xs mt-1">Исполнитель выбран. Обсуждение и сдача работы происходят в рабочей области.</p>
                        </div>
                        <Link to={`/chat/${commission.id}`} className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                            <MessageSquare className="w-4 h-4" /> Открыть рабочую область
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">

                        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm relative overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isAvailable ? "bg-slate-900" : "bg-emerald-500"}`} />

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
                                    Заказчик: {commission.client?.displayedName ? (
                                    <Link to={`/users/${commission.clientId}`} className="text-slate-900 font-bold hover:underline">
                                        {commission.client.displayedName}
                                    </Link>
                                ) : (
                                    <span className="text-slate-400 font-medium italic">Скрыт</span>
                                )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Описание задачи:</h3>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                                    {commission.description || "Заказчик не оставил подробного описания."}
                                </p>
                            </div>
                        </div>

                        {/* Секция Откликов */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between px-1">
                                <span>Отклики исполнителей</span>
                                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">{bids.length}</span>
                            </h2>

                            {bids.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400 text-sm shadow-sm">
                                    На этот проект пока нет откликов.
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {bids.map((bid: any) => (
                                        <div key={bid.id} className={`bg-white border ${bid.bidStatus === "accepted" ? "border-emerald-300 ring-2 ring-emerald-50" : "border-slate-200"} rounded-xl p-5 shadow-sm`}>
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                        <Link to={`/users/${bid.developerId}`} className="hover:underline">
                                                            {bid.developer?.displayedName || `Разработчик ID: ${bid.developerId.substring(0,6)}`}
                                                        </Link>
                                                        {bid.bidStatus === "accepted" && (
                                                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3" /> Выбран
                                                            </span>
                                                        )}
                                                    </h4>
                                                    <p className="text-xs text-slate-400 mt-1">Отклик от {new Date(bid.createdAt).toLocaleDateString("ru-RU")}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-slate-900">{bid.price ? `${bid.price} $` : "—"}</div>
                                                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">{bid.days ? `${bid.days} дн.` : "—"}</div>
                                                </div>
                                            </div>

                                            {isMyCommission && isAvailable && bid.bidStatus !== "accepted" && (
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

                    {/* ПРАВАЯ ПАНЕЛЬ СТАТУСА */}
                    <div className="sticky top-20 space-y-4">
                        {!isAvailable ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 mb-2">Проект недоступен</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Исполнитель уже выбран. Отклики больше не принимаются.
                                </p>
                            </div>
                        ) : user.role === "DEVELOPER" ? (
                            hasMyBid ? (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center shadow-sm">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                                    <h3 className="text-sm font-bold text-emerald-900">Вы откликнулись</h3>
                                    <p className="text-xs text-emerald-700 mt-2">Ожидайте ответа заказчика.</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 mb-2">Заинтересовал проект?</h3>
                                    <p className="text-xs text-slate-500 mb-4">Отправьте свой отклик, чтобы заказчик мог связаться с вами.</p>
                                    <Button onClick={() => setIsBidModalOpen(true)} className="w-full">
                                        Оставить отклик
                                    </Button>
                                </div>
                            )
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 mb-2">Это ваш проект</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Ожидайте отклики исполнителей в левой панели.
                                </p>
                            </div>
                        )}
                    </div>

                </div>

                <Modal isOpen={isBidModalOpen} onClose={() => setIsBidModalOpen(false)} title="Предложить свои услуги">
                    <Form method="post" className="space-y-4" onSubmit={() => setTimeout(() => setIsBidModalOpen(false), 300)}>
                        <input type="hidden" name="intent" value="create_bid" />

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Цена ($)"
                                name="price"
                                type="number"
                                required
                                defaultValue={commission.budgetMin}
                                min={1}
                                max={99999999} // Жесткий лимит, чтобы int в базе не взрывался
                            />
                            <Input
                                label="Срок (дни)"
                                name="days"
                                type="number"
                                required
                                defaultValue={7}
                                min={1}
                                max={365} // Ограничение на срок
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-700 mb-1.5 ml-0.5 block">Сопроводительное письмо</label>
                            <textarea
                                name="comment"
                                rows={5}
                                required
                                placeholder="Опишите ваш опыт и почему вы подходите для этой задачи..."
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsBidModalOpen(false)}>Отмена</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Отправка..." : "Отправить отклик"}
                            </Button>
                        </div>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}