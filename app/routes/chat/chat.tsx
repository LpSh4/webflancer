import { useParams, Link } from "react-router";
import { useRef } from "react";
import { Paperclip, Send, CheckCircle2, FileText, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "~/shared/ui/Button";

export default function ChatPage() {
    const { orderId } = useParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex-1 bg-slate-50 p-6 h-[calc(100vh-56px)] flex flex-col">
            <div className="max-w-6xl mx-auto w-full h-full flex flex-col">

                <div className="mb-4">
                    <Link to={`/commissions/${orderId}`} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Вернуться к деталям заказа
                    </Link>
                </div>

                <div className="flex flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-0">
                    {/* ЧАТ */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">Рабочая область проекта</h2>
                                <p className="text-[10px] text-slate-400 mt-0.5">ID: {orderId}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                            {/* Заглушка сообщения от системы/заказчика */}
                            <div className="flex flex-col gap-1 items-start">
                                <span className="text-[10px] font-bold text-slate-400 ml-1">Система</span>
                                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm text-xs text-slate-700 max-w-[80%] shadow-sm">
                                    Исполнитель выбран. Вы можете начать обсуждение деталей проекта.
                                </div>
                            </div>

                            {/* Пример файла в чате (от тебя) */}
                            <div className="flex flex-col gap-1 items-end">
                                <span className="text-[10px] font-bold text-slate-400 mr-1">Вы</span>
                                <div className="bg-slate-100 border border-slate-200 p-3 rounded-2xl rounded-tr-sm text-xs max-w-[80%]">
                                    <div className="flex items-center gap-3 w-max">
                                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                                            <FileText className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">design_v2.fig</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">2.4 MB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ИНПУТ */}
                        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 focus-within:border-slate-900 transition-colors">
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                    <Paperclip className="w-4 h-4 text-slate-500" />
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" />
                                <input className="flex-1 bg-transparent text-xs outline-none px-2 text-slate-900 placeholder:text-slate-400" placeholder="Написать сообщение или вставить файл..." />
                                <Button variant="primary" className="p-2.5 rounded-lg px-3">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* САЙДБАР УПРАВЛЕНИЯ */}
                    <div className="w-80 border-l border-slate-100 bg-white p-6 flex flex-col gap-8 shrink-0 overflow-y-auto">
                        <div>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Прогресс сделки</h3>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[60%]" />
                            </div>
                            <p className="text-[10px] font-medium text-slate-500 mt-2">60% этапов завершено (Разработка)</p>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Действия</h3>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-2 p-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100">
                                    <CheckCircle2 className="w-4 h-4" /> Принять этап работы
                                </button>
                                <button className="w-full flex items-center gap-2 p-2.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-100">
                                    <AlertCircle className="w-4 h-4" /> Запросить правки
                                </button>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                                Средства надежно защищены. Оплата переводится исполнителю только после принятия работы.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}