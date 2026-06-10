import { useParams, Link, useLoaderData, Form, useNavigation, useActionData } from "react-router";
import type { Route } from "./+types/chat";
import { useRef, useEffect, useState } from "react";
import { Paperclip, Send, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Flag, User as UserIcon } from "lucide-react";
import { Button } from "~/shared/ui/Button";
import { getUser } from "~/shared/utils/auth.server";
import { api } from "~/shared/utils/api.server";
import { getSocket } from "~/shared/utils/socket.client";

// Статусы этапов (должны совпадать с бэкендом!)
const WORK_STAGES = [
    { value: "PENDING", label: "Подготовка", percent: 5 },
    { value: "REQUIREMENTS", label: "Сбор требований", percent: 15 },
    { value: "UI_UX_DESIGN", label: "Дизайн (UI/UX)", percent: 30 },
    { value: "DB_DESIGN", label: "Архитектура БД", percent: 45 },
    { value: "BACKEND_DEV", label: "Backend разработка", percent: 60 },
    { value: "FRONTEND_DEV", label: "Frontend разработка", percent: 75 },
    { value: "DEVOPS_EST", label: "DevOps", percent: 85 },
    { value: "INTEGRATION", label: "Интеграция", percent: 95 },
    { value: "PRODUCTION", label: "Продакшен", percent: 100 },
];

export async function loader({ request, params }: Route.LoaderArgs) {
    const { user } = await getUser(request);
    const cookieHeader = request.headers.get("Cookie");
    const headers = cookieHeader ? { Cookie: cookieHeader } : undefined;

    try {
        const [commissionRes, proposalsRes] = await Promise.all([
            api.get(`/commissions/view/${params.orderId}`, { headers }),
            api.get(`/proposals/commission/${params.orderId}`, { headers })
        ]);

        return {
            user,
            commission: commissionRes.data,
            proposals: proposalsRes.data
        };
    } catch (error) {
        throw new Response("Заказ не найден или у вас нет доступа", { status: 404 });
    }
}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const cookieHeader = request.headers.get("Cookie");
    const headers = { Cookie: cookieHeader };

    try {
        if (intent === "request_next_stage") {
            const nextStage = formData.get("nextStage");
            await api.post(`/proposals/create/${params.orderId}`, { workStatus: nextStage }, { headers });
            return { success: true, message: "Запрос на проверку этапа отправлен заказчику" };
        }
        if (intent === "accept_stage") {
            const proposalId = formData.get("proposalId");
            await api.post(`/proposals/change-status/${proposalId}`, { status: "ACCEPTED" }, { headers });
            return { success: true, message: "Этап принят!" };
        }
        if (intent === "reject_stage") {
            const proposalId = formData.get("proposalId");
            await api.post(`/proposals/change-status/${proposalId}`, { status: "REJECTED" }, { headers });
            return { success: true, message: "Этап отправлен на доработку" };
        }
        if (intent === "complete_commission") {
            // 🔥 Вызываем метод завершения заказа (убедись, что роут на бэке именно такой, или поправь под свой)
            await api.post(`/commissions/complete/${params.orderId}`, {}, { headers });
            return { success: true, message: "Проект успешно завершен! Теперь можно оставить отзыв." };
        }
        return null;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || "Ошибка на сервере" };
    }
}

export default function ChatPage() {
    const { orderId } = useParams();
    const { user, commission, proposals } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    const isSubmitting = navigation.state === "submitting";

    const currentStageIndex = WORK_STAGES.findIndex(s => s.value === commission.commissionWorkStatus);
    const currentStage = WORK_STAGES[currentStageIndex] || WORK_STAGES[0];
    const nextStage = WORK_STAGES[currentStageIndex + 1];
    const isFinished = currentStage.percent === 100;
    const isOfficiallyCompleted = commission.commissionProgress === "COMPLETED";

    const activeProposal = Array.isArray(proposals) ? proposals.find((p: any) => p.status === "PENDING") : null;
    const proposedStageName = activeProposal
        ? WORK_STAGES.find(s => s.value === activeProposal.proposedStatus)?.label
        : "";

    // Определяем имя собеседника
    const partnerName = user.role === "CLIENT"
        ? (commission.developer?.displayedName || `Исполнитель`)
        : (commission.client?.displayedName || `Заказчик`);

    useEffect(() => {
        if (!orderId) return;

        const socket = getSocket();
        socket.connect();

        socket.on("connect", () => setIsSocketConnected(true));
        socket.on("disconnect", () => setIsSocketConnected(false));

        socket.off("workspace_history");
        socket.off("new_message");

        socket.emit("join_workspace", { orderId });

        socket.on("workspace_history", (history: any[]) => {
            const formatted = history.map(msg => ({
                ...msg,
                direction: msg.isSystem ? "system" : (msg.sender?.id === user.id ? "out" : "in")
            }));
            setMessages(formatted);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "instant" }), 50);
        });

        socket.on("new_message", (msg: any) => {
            if (!msg.isSystem && msg.sender?.id === user.id) return;
            setMessages(prev => [...prev, {
                ...msg,
                direction: msg.isSystem ? "system" : "in"
            }]);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("workspace_history");
            socket.off("new_message");
        };
    }, [orderId, user.id]);

    const sendMessage = () => {
        if (!inputValue.trim() || !orderId) return;

        const socket = getSocket();
        socket.emit("send_message", { orderId, content: inputValue });

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: inputValue,
            direction: "out",
            isSystem: false,
            sender: { id: user.id, name: "Вы" },
            sentAt: new Date().toISOString()
        }]);

        setInputValue("");
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const renderDeveloperActions = () => {
        if (isOfficiallyCompleted) {
            return (
                <div className="text-center py-5 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-emerald-800">Сделка закрыта!</p>
                    <Link to={`/commissions/${orderId}`} className="text-[10px] text-emerald-600 underline mt-2 block">
                        Перейти к отзывам
                    </Link>
                </div>
            );
        }

        if (isFinished) {
            return (
                <div className="text-center py-5 bg-blue-50 border border-blue-100 rounded-xl">
                    <Flag className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-blue-800">Все этапы сданы</p>
                    <p className="text-[10px] text-blue-600 mt-1 px-3">Ожидайте, пока заказчик официально завершит проект.</p>
                </div>
            );
        }

        if (activeProposal) {
            return (
                <div className="text-center space-y-2 py-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin mx-auto" />
                    <p className="text-[11px] font-bold text-amber-800">На проверке</p>
                    <p className="text-[10px] text-amber-600 px-3">Заказчик подтверждает переход на «{proposedStageName}»</p>
                </div>
            );
        }

        if (nextStage) {
            return (
                <Form method="post">
                    <input type="hidden" name="intent" value="request_next_stage" />
                    <input type="hidden" name="nextStage" value={nextStage.value} />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isSubmitting ? "Отправка..." : `Перейти к: ${nextStage.label}`}
                    </button>
                </Form>
            );
        }
        return null;
    };

    const renderClientActions = () => {
        if (isOfficiallyCompleted) {
            return (
                <div className="text-center py-5 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-emerald-800">Сделка закрыта!</p>
                    <Link to={`/commissions/${orderId}`} className="text-[10px] font-bold text-emerald-700 underline mt-2 block">
                        Оставить отзыв
                    </Link>
                </div>
            );
        }

        // 🔥 КНОПКА ФИНАЛЬНОГО ЗАВЕРШЕНИЯ ПРОЕКТА ДЛЯ ЗАКАЗЧИКА 🔥
        if ((isFinished || currentStage.percent >=30) && !activeProposal) {
            return (
                <div className="text-center py-5 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xs font-bold text-blue-800 mb-3"> {isFinished ? "Все этапы пройдены!" : "Пропустить выполнение этапов:"}</p>
                    <Form method="post" className="px-3">
                        <input type="hidden" name="intent" value="complete_commission" />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                        >
                            {isSubmitting ? "Завершение..." : "Завершить проект"}
                        </button>
                    </Form>
                </div>
            );
        }

        if (activeProposal) {
            return (
                <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-sm">
                        <p className="text-[10px] text-slate-500 mb-1">Разработчик хочет перейти на этап:</p>
                        <p className="text-xs font-bold text-blue-600">«{proposedStageName}»</p>
                    </div>
                    <Form method="post">
                        <input type="hidden" name="intent" value="accept_stage" />
                        <input type="hidden" name="proposalId" value={activeProposal.id} />
                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 p-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4" /> Принять
                        </button>
                    </Form>
                    <Form method="post">
                        <input type="hidden" name="intent" value="reject_stage" />
                        <input type="hidden" name="proposalId" value={activeProposal.id} />
                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 p-2.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200">
                            <AlertCircle className="w-4 h-4" /> На доработку
                        </button>
                    </Form>
                </div>
            );
        }

        return (
            <div className="text-center py-4 bg-white border border-slate-100 rounded-xl">
                <p className="text-[10px] text-slate-400 leading-relaxed px-3">
                    Исполнитель работает над этапом<br />
                    <strong className="text-slate-600">«{currentStage.label}»</strong>
                </p>
            </div>
        );
    };

    return (
        <div className="bg-slate-50 p-6 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
            <div className="max-w-6xl mx-auto w-full h-full flex flex-col min-h-0">

                {/* ШАПКА */}
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                    <Link to={`/commissions/${orderId}`} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Вернуться к заказу
                    </Link>

                    {actionData && (
                        <div className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 shadow-sm ${actionData.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {actionData.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {actionData.message}
                        </div>
                    )}
                </div>

                <div className="flex flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-0">

                    {/* ЛЕВАЯ ЧАСТЬ: ЧАТ */}
                    <div className="flex-1 flex flex-col min-w-0 min-h-0">
                        {/* Заголовок чата (Теперь видно собеседника!) */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 truncate">{commission.title}</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[10px] flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${isSocketConnected ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                        <span className="text-slate-400">{isSocketConnected ? 'Чат активен' : 'Пользователь оффлайн'}</span>
                                    </p>
                                    <span className="text-slate-300">|</span>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <UserIcon className="w-3 h-3" /> Собеседник: <strong className="text-slate-700">{partnerName}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* СООБЩЕНИЯ */}
                        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 bg-slate-50/30">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Send className="w-5 h-5 text-slate-300" />
                                    </div>
                                    <p className="text-xs font-medium">Начните обсуждение проекта</p>
                                </div>
                            )}

                            {messages.map((msg, idx) => {
                                if (msg.direction === "system" || msg.isSystem) {
                                    return (
                                        <div key={msg.id || idx} className="flex items-center gap-3 my-4">
                                            <div className="flex-1 h-px bg-slate-100" />
                                            <div className="bg-slate-100 px-3 py-1.5 rounded-full text-[10px] font-medium text-slate-500 whitespace-nowrap">
                                                {msg.text}
                                            </div>
                                            <div className="flex-1 h-px bg-slate-100" />
                                        </div>
                                    );
                                }

                                const isOut = msg.direction === "out";
                                return (
                                    <div key={msg.id || idx} className={`flex flex-col gap-1 ${isOut ? "items-end" : "items-start"}`}>
                                        <span className={`text-[10px] font-semibold text-slate-400 ${isOut ? "mr-1" : "ml-1"}`}>
                                            {isOut ? "Вы" : msg.sender?.name || partnerName}
                                        </span>
                                        <div className={`p-3 rounded-2xl text-xs max-w-[75%] leading-relaxed ${
                                            isOut
                                                ? "bg-slate-900 text-white rounded-tr-sm"
                                                : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                                        }`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[9px] text-slate-400 mx-1">
                                            {new Date(msg.sentAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* ИНПУТ */}
                        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 focus-within:border-slate-400 transition-colors">
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-200 rounded-lg transition-colors shrink-0">
                                    <Paperclip className="w-4 h-4 text-slate-400" />
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" />
                                <input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                    className="flex-1 bg-transparent text-xs outline-none px-1 text-slate-900 placeholder:text-slate-400"
                                    placeholder={isOfficiallyCompleted ? "Проект завершен, чат закрыт" : "Написать сообщение..."}
                                    disabled={isOfficiallyCompleted}
                                />
                                <Button onClick={sendMessage} variant="primary" disabled={isOfficiallyCompleted} className="p-2.5 rounded-lg px-3 shrink-0">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* ПРАВАЯ ЧАСТЬ: САЙДБАР */}
                    <div className="w-72 border-l border-slate-100 bg-white flex flex-col shrink-0 overflow-y-auto">

                        {/* Прогресс */}
                        <div className="p-5 border-b border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Прогресс</span>
                                <span className="text-sm font-black text-slate-900">{isOfficiallyCompleted ? "100" : currentStage.percent}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${isFinished || isOfficiallyCompleted ? 'bg-emerald-500' : 'bg-slate-900'}`}
                                    style={{ width: `${isOfficiallyCompleted ? 100 : currentStage.percent}%` }}
                                />
                            </div>

                            {/* Шаги */}
                            <div className="mt-4 space-y-1.5">
                                {WORK_STAGES.map((stage, i) => {
                                    const isDone = isOfficiallyCompleted || i < currentStageIndex;
                                    const isCurrent = !isOfficiallyCompleted && i === currentStageIndex;
                                    return (
                                        <div key={stage.value} className={`flex items-center gap-2 py-1 px-2 rounded-lg transition-colors ${isCurrent ? 'bg-slate-50' : ''}`}>
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                                isDone ? 'bg-emerald-500' :
                                                    isCurrent ? 'bg-slate-900' : 'bg-slate-100'
                                            }`}>
                                                {isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                            <span className={`text-[10px] ${
                                                isDone ? 'text-emerald-600 font-medium' :
                                                    isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'
                                            }`}>
                                                {stage.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Действия */}
                        <div className="p-5 flex-1">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Действия</h3>
                            {user.role === "DEVELOPER" ? renderDeveloperActions() : renderClientActions()}
                        </div>

                        {/* Футер */}
                        <div className="p-5 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                                Оплата переводится после финального подтверждения заказчика
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}