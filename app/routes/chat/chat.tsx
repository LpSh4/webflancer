import { useParams } from "react-router";
import { useState, useRef } from "react";
import { Paperclip, Send, CheckCircle2, FileText, AlertCircle } from "lucide-react";

export default function ChatPage() {
    const { orderId } = useParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex h-[90vh] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
            {/* 1. ЧАТ (70% ширины) */}
            <div className="flex-1 flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Обсуждение заказа</h2>
                        <p className="text-[10px] text-slate-400">ID: {orderId}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Пример файла в чате */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3 w-max">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-xs font-bold">design_v2.fig</p>
                            <p className="text-[10px] text-slate-400">2.4 MB • Скачать</p>
                        </div>
                    </div>
                </div>

                {/* ИНПУТ С ФАЙЛАМИ */}
                <div className="p-4 border-t border-slate-100 bg-white">
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 focus-within:border-slate-900">
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-200 rounded-lg">
                            <Paperclip className="w-4 h-4 text-slate-500" />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" />
                        <input className="flex-1 bg-transparent text-xs outline-none" placeholder="Написать сообщение или вставить файл..." />
                        <button className="bg-slate-900 text-white p-2 rounded-lg">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. ПРАВЫЙ САЙДБАР (Контекст - БЕЗ ЛИСТАНИЯ) */}
            <div className="w-80 border-l border-slate-100 bg-slate-50/30 p-6 flex flex-col gap-6">
                <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Прогресс сделки</h3>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[60%]" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">60% этапов завершено</p>
                </div>

                <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Действия</h3>
                    <div className="space-y-2">
                        <button className="w-full flex items-center gap-2 p-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" /> Принять работу
                        </button>
                        <button className="w-full flex items-center gap-2 p-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg">
                            <AlertCircle className="w-4 h-4" /> Запросить правки
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}