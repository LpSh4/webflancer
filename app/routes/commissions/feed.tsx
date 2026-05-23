import { useLoaderData, useActionData, useSearchParams } from "react-router";
import type { Route } from "./+types/feed";
import { useState } from "react";
import { getUser } from "~/shared/utils/auth.server";
import { api } from "~/shared/utils/api.server";
import { CommissionCard } from "~/features/commission/ui/CommissionCard";
import { CommissionFilters } from "~/features/commission/ui/CommissionFilters";
import { CreateCommissionModal } from "~/features/commission/ui/CreateCommissionModal";
import { Button } from "~/shared/ui/Button";
import { PlusCircle, SearchX, CheckCircle2, AlertCircle } from "lucide-react";
import { createCommissionSchema } from "~/features/commission/commission.schema";

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

    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();

    let commissions: Commission[] = [];

    try {
        if (user.role === "CLIENT") {
            const response = await api.get(`/commissions/user/${user.id}`, {
                headers: { Cookie: cookieHeader }
            });
            commissions = response.data;
        } else {
            const response = await api.get(`/commissions/search?${searchParams}`, {
                headers: { Cookie: cookieHeader }
            });
            commissions = response.data.data || [];
        }
    } catch (error) {
        console.error("[Feed Loader] Ошибка загрузки заказов:", error);
    }

    return { user, commissions };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const cookieHeader = request.headers.get("Cookie");

    // Валидируем через Zod
    const result = createCommissionSchema.safeParse(data);

    if (!result.success) {
        return {
            success: false,
            fieldErrors: result.error.flatten().fieldErrors,
            error: null,
        };
    }

    // Собираем проверенный payload
    const payload = {
        type: result.data.type,
        title: result.data.title,
        description: result.data.description || "",
        functionality: result.data.functionality || "",
        designLink: result.data.designLink || "",
        budgetMin: result.data.budgetMin,
        budgetMax: result.data.budgetMax || null,
        deadLine: result.data.deadLine ? new Date(result.data.deadLine).toISOString() : null,
        references: [] as string[]
    };

    try {
        await api.post('/commissions/create', payload, {
            headers: { Cookie: cookieHeader }
        });
        return { success: true, fieldErrors: null, error: null };
    } catch (error: any) {
        console.error("[Feed Action] Ошибка создания заказа:", error.message);
        return {
            success: false,
            fieldErrors: null,
            error: error.response?.data?.message || "Бэкенд недоступен или вернул ошибку"
        };
    }
}

export default function CommissionsPage() {
    const { user, commissions: initialCommissions } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const [searchParams] = useSearchParams();

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Локальная фильтрация для клиента (для разраба делает бэкенд)
    const filteredCommissions = initialCommissions.filter(item => {
        if (user.role === "DEVELOPER" && item.commissionProgress !== "POSTED") {
            return false;
        }

        if (user.role === "CLIENT") {
            const keywords = searchParams.get("keywords")?.toLowerCase() || "";
            const type = searchParams.get("commissionType") || "ALL";

            const matchesSearch = item.title.toLowerCase().includes(keywords);
            const matchesType = type === "ALL" || item.commissionType === type;
            return matchesSearch && matchesType;
        }

        return true;
    });

    return (
        <div className="flex-1 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-10">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {user.role === "DEVELOPER" ? "Лента заказов" : "Мои заказы"}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            {user.role === "DEVELOPER" ? "Ищите проекты и предлагайте свои услуги" : "Управляйте вашими опубликованными проектами"}
                        </p>
                    </div>

                    {user.role === "CLIENT" && (
                        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                            <PlusCircle className="w-4 h-4" /> Создать заказ
                        </Button>
                    )}
                </div>

                {/* Уведомления об успехе (ошибки выводятся внутри модалки) */}
                {actionData?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 mb-6">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Заказ успешно опубликован!
                    </div>
                )}

                <div className="mb-6">
                    <CommissionFilters />
                </div>

                {filteredCommissions.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center text-slate-400">
                        <SearchX className="w-12 h-12 mb-4 text-slate-300" />
                        <p className="text-base font-bold text-slate-700">Заказы не найдены</p>
                        <p className="text-sm mt-1 text-slate-500">Попробуйте изменить параметры фильтра.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCommissions.map((item) => (
                            <CommissionCard key={item.id} commission={item} viewerRole={user.role} />
                        ))}
                    </div>
                )}

                <CreateCommissionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </div>
        </div>
    );
}