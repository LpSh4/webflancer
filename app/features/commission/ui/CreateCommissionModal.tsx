import { useEffect, useState } from "react";
import type { FetcherWithComponents } from "react-router";
import { Modal } from "~/shared/ui/Modal";
import { Input } from "~/shared/ui/Input";
import { Button } from "~/shared/ui/Button";
import {
    Layers,
    DollarSign,
    FileText,
    CheckSquare,
    AlertCircle
} from "lucide-react";

interface CreateCommissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    fetcher?: FetcherWithComponents<any>;
}

export function CreateCommissionModal({ isOpen, onClose, fetcher }: CreateCommissionModalProps) {
    const actionData = fetcher?.data as {
        success?: boolean;
        error?: string | null;
        fieldErrors?: Record<string, string[]> | null;
    } | undefined;

    const isSubmitting = fetcher?.state === "submitting";

    // 🔥 Исправление TS18048 & TS17002: Явно указываем тип для динамического компонента формы
    const FormComponent = (fetcher?.Form || "form") as React.ComponentType<any> | "form";

    const [descLength, setDescLength] = useState(0);
    const [designUrl, setDesignUrl] = useState("");

    const todayStr = new Date().toISOString().split("T")[0];

    const handleUrlBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        let value = e.target.value.trim();
        if (value && !/^https?:\/\//i.test(value)) {
            value = `https://${value}`;
            setDesignUrl(value);
        }
    };

    useEffect(() => {
        if (actionData?.success) {
            onClose();
            setDescLength(0);
            setDesignUrl("");
        }
    }, [actionData, onClose]);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Опубликовать новый проект" maxWidth="max-w-2xl">
            <FormComponent method="post" className="space-y-5 text-slate-700">

                {actionData?.error && (
                    <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2 shadow-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{actionData.error}</span>
                    </div>
                )}

                <div className="relative">
                    <Input
                        label="Название проекта"
                        name="title"
                        required
                        minLength={5}
                        maxLength={100}
                        placeholder="Например: Разработка маркетплейса на React"
                        error={actionData?.fieldErrors?.title?.[0]}
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 ml-0.5 flex items-center gap-1.5 uppercase tracking-wider">
                        <Layers className="w-3.5 h-3.5 text-slate-400" /> Категория
                    </label>
                    <div className="relative">
                        <select
                            name="type"
                            required
                            className={`w-full bg-white border ${
                                actionData?.fieldErrors?.type ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-slate-900"
                            } px-3 py-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-4 transition-all font-medium appearance-none cursor-pointer`}
                        >
                            <option value="">Выберите категорию проекта</option>
                            <optgroup label="Простые сайты">
                                <option value="LANDING_PAGE">Landing Page</option>
                                <option value="PORTFOLIO">Портфолио</option>
                                <option value="BLOG_NEWS">Блог / Новости</option>
                            </optgroup>
                            <optgroup label="Бизнес & E-Commerce">
                                <option value="CORPORATE_BUSINESS">Корпоративный сайт</option>
                                <option value="E_COMMERCE_STORE">Интернет-магазин</option>
                                <option value="MARKETPLACE">Маркетплейс</option>
                            </optgroup>
                            <optgroup label="Веб-сервисы">
                                <option value="SAAS_DASHBOARD">SaaS Dashboard</option>
                                <option value="CRM_ERP_SYSTEM">CRM / ERP Система</option>
                                <option value="CUSTOM_DEVELOPMENT">Кастомная разработка</option>
                            </optgroup>
                        </select>
                    </div>
                    {actionData?.fieldErrors?.type && (
                        <span className="text-red-500 text-xs font-medium mt-1.5 ml-0.5 block">{actionData.fieldErrors.type[0]}</span>
                    )}
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 ml-0.5 flex items-center gap-1.5 uppercase tracking-wider">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Бюджет проекта
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            name="budgetMin"
                            type="number"
                            required
                            min={10}
                            defaultValue={50}
                            placeholder="Мин. ($)"
                            error={actionData?.fieldErrors?.budgetMin?.[0]}
                        />
                        <Input
                            name="budgetMax"
                            type="number"
                            min={10}
                            placeholder="Макс. (Опционально) ($)"
                            error={actionData?.fieldErrors?.budgetMax?.[0]}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Input
                            label="Ссылка на дизайн"
                            name="designLink"
                            type="url"
                            value={designUrl}
                            onChange={(e) => setDesignUrl(e.target.value)}
                            onBlur={handleUrlBlur}
                            placeholder="figma.com/file/..."
                            error={actionData?.fieldErrors?.designLink?.[0]}
                        />
                    </div>
                    <div>
                        <Input
                            label="Срок сдачи (Дедлайн)"
                            name="deadLine"
                            type="date"
                            min={todayStr}
                            error={actionData?.fieldErrors?.deadLine?.[0]}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5 ml-0.5">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                            <FileText className="w-3.5 h-3.5 text-slate-400" /> Техническое задание
                        </label>
                        <span className={`text-[10px] font-bold ${descLength < 20 ? 'text-amber-500' : 'text-slate-400'}`}>
                            {descLength} / 2000 симв. (мин. 20)
                        </span>
                    </div>
                    <textarea
                        name="description"
                        rows={4}
                        required
                        minLength={20}
                        maxLength={2000}
                        onChange={(e) => setDescLength(e.target.value.length)}
                        placeholder="Опишите требования, стек, бизнес-логику и ключевые детали задачи..."
                        className={`w-full bg-white border ${
                            actionData?.fieldErrors?.description ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-slate-900"
                        } px-3 py-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-4 transition-all resize-none font-medium placeholder:text-slate-400`}
                    />
                    {actionData?.fieldErrors?.description && (
                        <span className="text-red-500 text-xs font-medium mt-1.5 ml-0.5 block">{actionData.fieldErrors.description[0]}</span>
                    )}
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 ml-0.5 flex items-center gap-1.5 uppercase tracking-wider">
                        <CheckSquare className="w-3.5 h-3.5 text-slate-400" /> Ожидаемый функционал
                    </label>
                    <textarea
                        name="functionality"
                        rows={2}
                        maxLength={1000}
                        placeholder="Авторизация через OAuth, интеграция Telegram-бота, Stripe..."
                        className="w-full bg-white border border-slate-200 focus:border-slate-900 px-3 py-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-4 transition-all resize-none font-medium placeholder:text-slate-400"
                    />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="rounded-xl">
                        Отмена
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="rounded-xl shadow-sm px-5">
                        {isSubmitting ? "Публикация..." : "Разместить заказ"}
                    </Button>
                </div>
            {/* Обрати внимание, закрываем через строчный тег, так как в начале мы явно привели тип */}
        </FormComponent>
</Modal>
);
}