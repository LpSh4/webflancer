import { useEffect } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import { Modal } from "~/shared/ui/Modal";
import { Input } from "~/shared/ui/Input";
import { Button } from "~/shared/ui/Button";

interface CreateCommissionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateCommissionModal({ isOpen, onClose }: CreateCommissionModalProps) {
    // Получаем данные из action текущего роута
    const actionData = useActionData<{
        success?: boolean;
        error?: string | null;
        fieldErrors?: Record<string, string[]> | null;
    }>();

    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    // Закрываем модалку ТОЛЬКО при успешной отправке на бэкенд
    useEffect(() => {
        if (actionData?.success) {
            onClose();
        }
    }, [actionData, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Опубликовать новый проект" maxWidth="max-w-2xl">
            <Form method="post" className="space-y-5">

                {/* Глобальная ошибка с бэкенда */}
                {actionData?.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium text-center">
                        {actionData.error}
                    </div>
                )}

                <Input
                    label="Название проекта"
                    name="title"
                    required
                    placeholder="Например: Лендинг для ресторана"
                    error={actionData?.fieldErrors?.title?.[0]}
                />

                <div>
                    <label className="text-xs font-medium text-slate-700 mb-1.5 ml-0.5 block">Категория</label>
                    <select
                        name="type"
                        required
                        className={`w-full bg-white border ${
                            actionData?.fieldErrors?.type ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-slate-900"
                        } px-3 py-2.5 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium`}
                    >
                        <option value="">Выберите категорию проекта</option>
                        <optgroup label="Простые сайты">
                            <option value="LANDING_PAGE">Landing Page</option>
                            <option value="PORTFOLIO">Портфолио</option>
                            <option value="BLOG_NEWS">Блог / Новости</option>
                            <option value="PROMOTIONAL_MICROSITE">Промо-сайт</option>
                        </optgroup>
                        <optgroup label="Бизнес">
                            <option value="CORPORATE_BUSINESS">Корпоративный сайт</option>
                            <option value="NON_PROFIT_CHARITY">Некоммерческий проект</option>
                            <option value="EDUCATIONAL_LMS">Образовательная платформа</option>
                        </optgroup>
                        <optgroup label="E-Commerce">
                            <option value="E_COMMERCE_STORE">Интернет-магазин</option>
                            <option value="MARKETPLACE">Маркетплейс</option>
                            <option value="BOOKING_RESERVATION">Система бронирования</option>
                        </optgroup>
                        <optgroup label="Веб-сервисы">
                            <option value="SPA">SPA Приложение</option>
                            <option value="PWA">PWA Приложение</option>
                            <option value="SAAS_DASHBOARD">SaaS Dashboard</option>
                            <option value="CRM_ERP_SYSTEM">CRM / ERP Система</option>
                            <option value="SOCIAL_NETWORK">Социальная сеть</option>
                            <option value="FORUM_COMMUNITY">Форум</option>
                        </optgroup>
                        <optgroup label="Специфичные">
                            <option value="RE_ESTATE_LISTING">Недвижимость</option>
                            <option value="PORTAL_INTRANET">Внутренний портал</option>
                            <option value="WIKI_KNOWLEDGE_BASE">База знаний</option>
                            <option value="CUSTOM_DEVELOPMENT">Кастомная разработка</option>
                            <option value="OTHER">Другое</option>
                        </optgroup>
                    </select>
                    {actionData?.fieldErrors?.type && (
                        <span className="text-red-500 text-xs font-medium mt-1.5 ml-0.5 block">
                            {actionData.fieldErrors.type[0]}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Мин. бюджет ($)"
                        name="budgetMin"
                        type="number"
                        required
                        defaultValue={50}
                        error={actionData?.fieldErrors?.budgetMin?.[0]}
                    />
                    <Input
                        label="Макс. бюджет ($)"
                        name="budgetMax"
                        type="number"
                        placeholder="Опционально"
                        error={actionData?.fieldErrors?.budgetMax?.[0]}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Ссылка на дизайн"
                        name="designLink"
                        type="url"
                        placeholder="https://figma.com/..."
                        error={actionData?.fieldErrors?.designLink?.[0]}
                    />
                    <Input
                        label="Дедлайн"
                        name="deadLine"
                        type="date"
                        error={actionData?.fieldErrors?.deadLine?.[0]}
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-slate-700 mb-1.5 ml-0.5 block">Техническое задание</label>
                    <textarea
                        name="description"
                        rows={4}
                        required
                        placeholder="Опишите требования, стек и детали задачи..."
                        className={`w-full bg-white border ${
                            actionData?.fieldErrors?.description ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/5"
                        } px-3 py-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-4 transition-all resize-none`}
                    />
                    {actionData?.fieldErrors?.description && (
                        <span className="text-red-500 text-xs font-medium mt-1.5 ml-0.5 block">
                            {actionData.fieldErrors.description[0]}
                        </span>
                    )}
                </div>

                <div>
                    <label className="text-xs font-medium text-slate-700 mb-1.5 ml-0.5 block">Ожидаемый функционал</label>
                    <textarea
                        name="functionality"
                        rows={2}
                        placeholder="Авторизация, платежный шлюз, интеграция с API..."
                        className={`w-full bg-white border ${
                            actionData?.fieldErrors?.functionality ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/5"
                        } px-3 py-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-4 transition-all resize-none`}
                    />
                    {actionData?.fieldErrors?.functionality && (
                        <span className="text-red-500 text-xs font-medium mt-1.5 ml-0.5 block">
                            {actionData.fieldErrors.functionality[0]}
                        </span>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Публикация..." : "Разместить заказ"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}