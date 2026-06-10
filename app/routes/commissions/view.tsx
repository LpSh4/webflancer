import { useLoaderData, useActionData, useNavigation, Form, Link } from "react-router";
import type { Route } from "./+types/view";
import { useState } from "react";
import { getUser } from "~/shared/utils/auth.server";
import { api } from "~/shared/utils/api.server";
import {ArrowLeft, Clock, Send, CheckCircle2, MessageSquare, Star, ShieldAlert} from "lucide-react";
import { Input } from "~/shared/ui/Input";
import { Info } from "lucide-react"; // Красивые иконки для предупреждений
import { Button } from "~/shared/ui/Button";
import { Modal } from "~/shared/ui/Modal";

export async function loader({ params, request }: Route.LoaderArgs) {
    const { user } = await getUser(request);
    const cookieHeader = request.headers.get("Cookie");
    const headers = { Cookie: cookieHeader };

    try {
        const [commissionRes, bidsRes] = await Promise.all([
            api.get(`/commissions/view/${params.id}`, { headers }),
            api.get(`/bids/commission/${params.id}`, { headers }),
        ]);

        // Пробуем загрузить отзыв — он может не существовать
        let review = null;
        try {
            const reviewRes = await api.get(`/reviews/commission-id/${params.id}`, { headers });
            review = reviewRes.data;
        } catch {
            // отзыва ещё нет — нормально
        }

        return { user, commission: commissionRes.data, bids: bidsRes.data, review };
    } catch (error: any) {
        throw new Response("Заказ не найден", { status: 404 });
    }
}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const cookieHeader = request.headers.get("Cookie");
    const headers = { Cookie: cookieHeader };

    if (intent === "create_bid") {
        try {
            await api.post(`/bids/create/${params.id}`, {}, { headers });
            return { success: true, message: "Отклик успешно отправлен!" };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Ошибка отправки." };
        }
    }

    if (intent === "accept_bid") {
        try {
            const cookieHeader = request.headers.get("Cookie") || "";
            const headers = {
                Cookie: cookieHeader,
            };
            console.log(cookieHeader)
            console.log(headers)
            await api.post(`/bids/accept/${formData.get("bidId")}`, {}, { headers });
            return { success: true, message: "Исполнитель выбран! Заказ переведён в работу." };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Ошибка." };
        }
    }

    if (intent === "create_review") {
        try {
            await api.post(`/reviews/create/${params.id}`, {
                rating: Number(formData.get("rating")),
                content: formData.get("content") as string,
            }, { headers });
            return { success: true, message: "Отзыв опубликован!" };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Ошибка." };
        }
    }

    return null;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="focus:outline-none"
                >
                    <Star
                        className={`w-6 h-6 transition-colors ${
                            star <= (hovered || value)
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-200 fill-slate-200"
                        }`}
                    />
                </button>
            ))}
            {value > 0 && (
                <span className="text-xs text-slate-500 ml-1 font-medium">{value} / 5</span>
            )}
        </div>
    );
}

export default function CommissionViewPage() {
    const { user, commission, bids, review } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [isBidModalOpen, setIsBidModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);

    const hasMyBid = bids.some((b: any) => b.developerId === user.id);
    const isMyCommission = commission.clientId === user.id;
    const isAvailable = commission.commissionProgress === "POSTED";
    const isCompleted = commission.commissionProgress === "COMPLETED";

    const acceptedBid = bids.find((b: any) => b.bidStatus === "accepted");
    const canAccessWorkspace = isMyCommission || (acceptedBid && acceptedBid.developerId === user.id);

    const [isAgreed, setIsAgreed] = useState(false);
    // Может ли юзер оставить отзыв
    const isParticipant = isMyCommission || (commission.developerId === user.id);
    const alreadyReviewed = user.role === "CLIENT"
        ? review?.clientRating != null
        : review?.developerRating != null;
    const canReview = isCompleted && isParticipant && !alreadyReviewed;

    return (
        <div className="flex-1 bg-slate-50 min-h-screen py-10">
            <div className="max-w-4xl mx-auto px-6">

                {/* Шапка */}
                <div className="flex justify-between items-center mb-6">
                    <Link to="/commissions" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Назад к заказам
                    </Link>

                    <div className="flex items-center gap-3">
                        {canReview && (
                            <Button
                                onClick={() => setIsReviewModalOpen(true)}
                                variant="ghost"
                                className="gap-2 border border-amber-200 text-amber-700 hover:bg-amber-50"
                            >
                                <Star className="w-3.5 h-3.5" /> Оставить отзыв
                            </Button>
                        )}
                        {user.role === "DEVELOPER" && !hasMyBid && !isMyCommission && isAvailable && (
                            <Button onClick={() => setIsBidModalOpen(true)} className="gap-2 shadow-sm">
                                <Send className="w-3.5 h-3.5" /> Откликнуться
                            </Button>
                        )}
                    </div>
                </div>

                {/* Статус сообщение из action */}
                {actionData && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                        actionData.success
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {actionData.success
                            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                            : <span className="w-4 h-4 shrink-0">✕</span>
                        }
                        {actionData.message}
                    </div>
                )}

                {/* Плашка рабочей области */}
                {!isAvailable && canAccessWorkspace && !isCompleted && (
                    <div className="mb-6 p-5 bg-white rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-200">
                        <div>
                            <h2 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Проект в работе
                            </h2>
                            <p className="text-slate-500 text-xs mt-1">Исполнитель выбран. Обсуждайте детали в рабочей области.</p>
                        </div>
                        <Link
                            to={`/chat/${commission.id}`}
                            className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" /> Открыть рабочую область
                        </Link>
                    </div>
                )}

                {/* Плашка завершён */}
                {isCompleted && isParticipant && (
                    <div className="mb-6 p-5 bg-white rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200">
                        <div>
                            <h2 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Проект завершён
                            </h2>
                            <p className="text-slate-500 text-xs mt-1">
                                {canReview
                                    ? "Оставьте отзыв о сотрудничестве — это помогает другим участникам."
                                    : "Отзыв уже оставлен. Спасибо!"}
                            </p>
                        </div>
                        {canReview && (
                            <Button
                                onClick={() => setIsReviewModalOpen(true)}
                                className="shrink-0 gap-2 bg-amber-500 hover:bg-amber-600 border-0"
                            >
                                <Star className="w-4 h-4" /> Оставить отзыв
                            </Button>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">

                        {/* Карточка заказа */}
                        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm relative overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                isCompleted ? "bg-emerald-500" :
                                    isAvailable ? "bg-slate-900" : "bg-blue-500"
                            }`} />

                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
                                    {commission.commissionType.replace(/_/g, " ")}
                                </span>
                                <div className="text-right">
                                    <div className="text-lg font-black text-slate-900">
                                        {commission.budgetMax
                                            ? `${commission.budgetMin} — ${commission.budgetMax} $`
                                            : `от ${commission.budgetMin} $`}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Бюджет</div>
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
                                <span className="text-slate-200">•</span>
                                <div>
                                    Заказчик:{" "}
                                    {commission.client?.displayedName ? (
                                        <Link to={`/users/${commission.clientId}`} className="text-slate-900 font-bold hover:underline">
                                            {commission.client.displayedName}
                                        </Link>
                                    ) : (
                                        <span className="text-slate-400 italic">Скрыт</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Описание</h3>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    {commission.description || "Заказчик не оставил подробного описания."}
                                </p>
                            </div>
                        </div>

                        {/* Отзывы */}
                        {isCompleted && review && (review.clientRating != null || review.developerRating != null) && (
                            <div className="space-y-3">
                                <h2 className="text-sm font-bold text-slate-900 px-1">Отзывы</h2>
                                <div className="grid gap-3">
                                    {review.clientRating != null && (
                                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-slate-700">Отзыв заказчика</span>
                                                <div className="flex items-center gap-1">
                                                    {[1,2,3,4,5].map(s => (
                                                        <Star key={s} className={`w-3.5 h-3.5 ${s <= review.clientRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                                                    ))}
                                                    <span className="text-xs text-slate-500 ml-1">{review.clientRating}</span>
                                                </div>
                                            </div>
                                            {review.clientReview && (
                                                <p className="text-xs text-slate-600 leading-relaxed">{review.clientReview}</p>
                                            )}
                                        </div>
                                    )}
                                    {review.developerRating != null && (
                                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-slate-700">Отзыв исполнителя</span>
                                                <div className="flex items-center gap-1">
                                                    {[1,2,3,4,5].map(s => (
                                                        <Star key={s} className={`w-3.5 h-3.5 ${s <= review.developerRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                                                    ))}
                                                    <span className="text-xs text-slate-500 ml-1">{review.developerRating}</span>
                                                </div>
                                            </div>
                                            {review.developerReview && (
                                                <p className="text-xs text-slate-600 leading-relaxed">{review.developerReview}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Отклики */}
                        {!isCompleted && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between px-1">
                                    <span>Отклики</span>
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{bids.length}</span>
                                </h2>

                                {bids.length === 0 ? (
                                    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400 text-sm shadow-sm">
                                        Пока никто не откликнулся.
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {bids.map((bid: any) => (
                                            <div
                                                key={bid.id}
                                                className={`bg-white border rounded-xl p-5 shadow-sm ${
                                                    bid.bidStatus === "accepted"
                                                        ? "border-emerald-200 ring-1 ring-emerald-100"
                                                        : "border-slate-200"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-700 shrink-0">
                                                            {bid.developer?.displayedName?.charAt(0).toUpperCase() ?? "?"}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <Link to={`/users/${bid.developerId}`} className="text-sm font-bold text-slate-900 hover:underline">
                                                                    {bid.developer?.displayedName ?? `Исполнитель #${bid.developerId.substring(0, 6)}`}
                                                                </Link>
                                                                {bid.bidStatus === "accepted" && (
                                                                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                                                        <CheckCircle2 className="w-3 h-3" /> Выбран
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                                {new Date(bid.createdAt).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long' })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {bid.developer?.averageRating > 0 && (
                                                        <div className="text-right shrink-0">
                                                            <div className="text-sm font-black text-slate-900 flex items-center gap-1 justify-end">
                                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                                {bid.developer.averageRating.toFixed(1)}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400">{bid.developer.reviewCount} отзывов</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {isMyCommission && isAvailable && bid.bidStatus !== "accepted" && (
                                                    <Form method="post" className="mt-4 pt-3 border-t border-slate-100">
                                                        <input type="hidden" name="intent" value="accept_bid" />
                                                        <input type="hidden" name="bidId" value={bid.id} />
                                                        <Button type="submit" variant="primary" disabled={isSubmitting} className="text-xs">
                                                            Выбрать исполнителем
                                                        </Button>
                                                    </Form>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Правая панель */}
                    <div className="sticky top-20 space-y-4">
                        {isCompleted ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">Проект завершён</h3>
                                <p className="text-xs text-slate-500">Работа принята и закрыта.</p>
                            </div>
                        ) : !isAvailable ? (
                            isMyCommission ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 mb-2">Исполнитель выбран</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">Проект переведён в работу. Общайтесь в рабочей области.</p>
                                </div>
                            ) : acceptedBid?.developerId === user.id ? (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center shadow-sm">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                                    <h3 className="text-sm font-bold text-emerald-900">Вы выбраны!</h3>
                                    <p className="text-xs text-emerald-700 mt-2">Заказчик выбрал вас. Перейдите в рабочую область.</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-500 mb-2">Набор закрыт</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">Заказчик уже выбрал исполнителя.</p>
                                </div>
                            )
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
                                    <p className="text-xs text-slate-500 mb-4">Отправьте отклик — заказчик сможет выбрать вас исполнителем.</p>
                                    <Button onClick={() => setIsBidModalOpen(true)} className="w-full">
                                        Оставить отклик
                                    </Button>
                                </div>
                            )
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 mb-2">Ваш проект</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Ожидайте отклики. Когда найдёте подходящего — нажмите «Выбрать исполнителем».
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Модалка отклика */}
                <Modal isOpen={isBidModalOpen} onClose={() => { setIsBidModalOpen(false); setIsAgreed(false); }} title="Откликнуться на заказ">
                    <Form method="post" className="space-y-4" onSubmit={() => setTimeout(() => { setIsBidModalOpen(false); setIsAgreed(false); }, 300)}>
                        <input type="hidden" name="intent" value="create_bid" />

                        {/* Передаем скрытый комментарий бэкенду, чтобы не ломать валидацию */}
                        <input type="hidden" name="comment" value="Отклик без сопроводительного письма. Условия платформы приняты." />

                        {/* Блок соглашения */}
                        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-slate-700 space-y-3">
                            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                                Внимание: Платформа прямого расчета
                            </div>

                            <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                                <p>
                                    Наша платформа выступает <strong>исключительно в роли доски объявлений</strong> и связующего звена. Мы не являемся гарантом сделки и не удерживаем средства пользователей.
                                </p>
                                <p>
                                    Вам придётся <strong>самостоятельно договариваться</strong> о том, как, когда и в какой валюте заказчик будет выплачивать вам гонорар (криптовалюта, банковские переводы, электронные кошельки и т. д.).
                                </p>
                                <p className="flex gap-1.5 text-slate-500 bg-white/60 border border-slate-100 p-2 rounded-md mt-1">
                                    <Info className="w-3.5 h-3.5 shrink-0 text-blue-500 mt-0.5" />
                                    Настоятельно рекомендуем брать предоплату, разбивать крупные задачи на мелкие этапы и не передавать финальные исходные коды до полного расчета.
                                </p>
                            </div>
                        </div>

                        {/* Чекбокс подтверждения */}
                        <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer select-none transition-colors">
                            <input
                                type="checkbox"
                                checked={isAgreed}
                                onChange={(e) => setIsAgreed(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900 focus:ring-offset-0 accent-slate-950"
                            />
                            <span className="text-xs text-slate-600 font-medium leading-tight">
                Я понимаю все риски, беру ответственность за финансовые расчеты на себя и хочу отправить отклик.
            </span>
                        </label>

                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                            <Button type="button" variant="ghost" onClick={() => { setIsBidModalOpen(false); setIsAgreed(false); }}>
                                Отмена
                            </Button>
                            {/* Кнопка активна только если проставлен чекбокс согласия */}
                            <Button type="submit" disabled={isSubmitting || !isAgreed}>
                                {isSubmitting ? "Отправка..." : "Отправить отклик"}
                            </Button>
                        </div>
                    </Form>
                </Modal>

                {/* Модалка отзыва */}
                <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title="Оставить отзыв">
                    <Form
                        method="post"
                        className="space-y-5"
                        onSubmit={() => setTimeout(() => setIsReviewModalOpen(false), 300)}
                    >
                        <input type="hidden" name="intent" value="create_review" />
                        <input type="hidden" name="rating" value={reviewRating} />

                        <div>
                            <label className="text-xs font-medium text-slate-700 mb-2 block">Оценка</label>
                            <StarRating value={reviewRating} onChange={setReviewRating} />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-700 mb-1.5 ml-0.5 block">Комментарий</label>
                            <textarea
                                name="content"
                                rows={4}
                                placeholder={
                                    user.role === "CLIENT"
                                        ? "Расскажите о качестве работы исполнителя..."
                                        : "Расскажите о сотрудничестве с заказчиком..."
                                }
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-1">
                            <Button type="button" variant="ghost" onClick={() => setIsReviewModalOpen(false)}>Отмена</Button>
                            <Button type="submit" disabled={isSubmitting || reviewRating === 0}>
                                {isSubmitting ? "Публикация..." : "Опубликовать"}
                            </Button>
                        </div>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}