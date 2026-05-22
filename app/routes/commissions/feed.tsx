import { useLoaderData, useActionData, useNavigation, Form } from "react-router";
import type { Route } from "./+types/feed";
import { useState } from "react";
import { getUser } from "~/shared/utils/auth.server";
import { api } from "~/shared/utils/api.server";
import { CommissionCard } from "~/features/commission/ui/CommissionCard";
import { CommissionFilters } from "~/features/commission/ui/CommissionFilters";
import { Input } from "~/shared/ui/Input";
import { Button } from "~/shared/ui/Button";
import { PlusCircle, SearchX, CheckCircle2, AlertCircle } from "lucide-react";

// Интерфейс заказа (синхронизирован с бэкендом)
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
}

export async function loader({ request }: Route.LoaderArgs) {
    const { user } = await getUser(request);
    const cookieHeader = request.headers.get("Cookie");

    let commissions: Commission[] = [];

    if (user.role === "CLIENT") {
        try {
            // Клиент получает только свои заказы
            const response = await api.get(`/commissions/user/${user.id}`, {
                headers: { Cookie: cookieHeader }
            });
            commissions = response.data;
        } catch (error) {
            console.error("[Feed Loader] Ошибка загрузки заказов клиента:", error);
        }
    } else {
        // TODO: Когда друг добавит роут GET /commissions для общей ленты, поменять на реальный запрос
        commissions = [
            {
                id: "mock-1",
                title: "Landing Page для крипто-стартапа (МОК)",
                description: "Ждем, когда бэкендер добавит роут для получения общей ленты заказов (GET /commissions)!",
                commissionType: "LANDING_PAGE",
                commissionProgress: "POSTED",
                budgetMin: 300,
                budgetMax: 500,
                deadline: null,
                createdAt: new Date().toISOString(),
                clientId: "mock-client"
            }
        ];
    }

    return { user, commissions };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const cookieHeader = request.headers.get("Cookie");

    // Формируем payload строго по схеме CreateCommissionSchema
    const payload = {
        type: formData.get("type"), // Бэкенд ждет 'type'
        title: formData.get("title"),
        description: formData.get("description") || "",
        functionality: formData.get("functionality") || "",
        designLink: formData.get("designLink") || "",
        budgetMin: Number(formData.get("budgetMin")),
        budgetMax: formData.get("budgetMax") ? Number(formData.get("budgetMax")) : null,
        // Бэкенд ждет deadLine с заглавной L и в формате ISO
        deadLine: formData.get("deadLine") ? new Date(formData.get("deadLine") as string).toISOString() : null,
        references: [] as string[]
    };

    try {
        await api.post('/commissions/create', payload, {
            headers: { Cookie: cookieHeader }
        });
        return { success: true, error: null };
    } catch (error: any) {
        console.error("[Feed Action] Ошибка создания заказа:", error.message);
        return {
            success: false,
            error: error.response?.data?.message || "Бэкенд недоступен или вернул ошибку"
        };
    }
}

export default function CommissionsPage() {
    const { user, commissions: initialCommissions } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("ALL");

    // Локальная фильтрация ленты
    const filteredCommissions = initialCommissions.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === "ALL" || item.commissionType === selectedType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="flex-1 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-10">

                {/* Заголовок */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {user.role === "DEVELOPER" ? "Лента заказов" : "Мои заказы"}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Вы вошли как: <span className="font-semibold text-slate-700">{user.displayedName}</span> ({user.role === "DEVELOPER" ? "Разработчик" : "Заказчик"})
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <CommissionFilters onSearchChange={setSearchQuery} onTypeChange={setSelectedType} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* ЛЕВАЯ ЧАСТЬ: Сетка заказов */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Плашки уведомлений */}
                        {actionData?.success && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 mb-4">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                Заказ успешно опубликован!
                            </div>
                        )}
                        {actionData?.error && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 mb-4">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                Ошибка: {actionData.error}
                            </div>
                        )}

                        {filteredCommissions.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-slate-400">
                                <SearchX className="w-10 h-10 mb-3 text-slate-300" />
                                <p className="text-sm font-bold text-slate-700">Заказы не найдены</p>
                                <p className="text-xs mt-1 text-slate-500">Попробуйте изменить параметры фильтра.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredCommissions.map((item) => (
                                    <CommissionCard key={item.id} commission={item} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ПРАВАЯ ЧАСТЬ: Панель управления (Форма для клиента) */}
                    <div className="sticky top-20 space-y-6">
                        {user.role === "CLIENT" ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <h2 className="text-sm font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                                    <PlusCircle className="w-4 h-4 text-slate-500" />
                                    Опубликовать проект
                                </h2>

                                <Form method="post" className="space-y-4">
                                    <Input
                                        label="Название проекта"
                                        name="title"
                                        required
                                        placeholder="Например: Лендинг для ресторана"
                                    />

                                    <div>
                                        <label className="text-xs font-medium text-slate-700 mb-1.5 ml-0.5 block">Тип разработки</label>
                                        <select name="type" className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all">
                                            <option value="LANDING_PAGE">Landing Page</option>
                                            <option value="PORTFOLIO">Портфолио</option>
                                            <option value="MARKETPLACE">Маркетплейс</option>
                                            <option value="SAAS_DASHBOARD">SaaS Dashboard</option>
                                            <option value="CRM_ERP_SYSTEM">CRM / ERP Система</option>
                                            <option value="CUSTOM_DEVELOPMENT">Кастомная разработка</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Input label="Мин. бюджет ($)" name="budgetMin" type="number" required defaultValue={50} />
                                        <Input label="Макс. бюджет ($)" name="budgetMax" type="number" placeholder="Опционально" />
                                    </div>

                                    <Input label="Ссылка на дизайн (Figma)" name="designLink" type="url" placeholder="https://figma.com/..." />
                                    <Input label="Дедлайн" name="deadLine" type="date" />

                                    <div>
                                        <label className="text-xs font-medium text-slate-700 mb-1.5 ml-0.5 block">Техническое задание</label>
                                        <textarea name="description" rows={3} required placeholder="Опишите требования..." className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all resize-none" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-slate-700 mb-1.5 ml-0.5 block">Функционал</label>
                                        <textarea name="functionality" rows={2} placeholder="Авторизация, корзина, оплата..." className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all resize-none" />
                                    </div>

                                    <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                                        {isSubmitting ? "Публикация..." : "Разместить заказ"}
                                    </Button>
                                </Form>
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-600 space-y-3">
                                <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-slate-400" />
                                    Информация
                                </h2>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Вы видите полную ленту актуальных заказов биржи. Нажмите на карточку любого проекта, чтобы изучить детальное ТЗ и оставить свой отклик.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}