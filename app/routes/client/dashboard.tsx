import { useLoaderData, Link, useFetcher } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/dashboard";
import { getUser } from "~/shared/utils/auth.server";
import { api } from "~/shared/utils/api.server";
import { FolderKanban, CheckCircle2, LayoutGrid, ArrowRight, PlusCircle } from "lucide-react";
import { Button } from "~/shared/ui/Button";
import { CreateCommissionModal } from "~/features/commission/ui/CreateCommissionModal";
import { createCommissionSchema } from "~/features/commission/commission.schema"; // 🔥 Вернули импорт схемы
import { COMMISSION_PROGRESS_LABELS } from "~/features/commission/commission.constants";

interface Commission {
    id: string;
    title: string;
    commissionType: string;
    commissionProgress: string;
    budgetMin: number;
    createdAt: string;
}

const getStatusStyles = (status: string) => {
    switch (status) {
        case "POSTED":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "CONTRACT_STARTED":
        case "DEVELOPMENT":
        case "TESTING":
            return "bg-amber-50 text-amber-700 border-amber-200";
        case "DEV_COMPLETE":
            return "bg-indigo-50 text-indigo-700 border-indigo-200";
        case "COMPLETED":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "CANCELLED":
        case "DISPUTED":
        case "REFUNDED":
            return "bg-red-50 text-red-700 border-red-200";
        default:
            return "bg-slate-100 text-slate-600 border-slate-200";
    }
};

export async function loader({ request }: Route.LoaderArgs) {
    const { user } = await getUser(request);
    const cookieHeader = request.headers.get("Cookie");

    let commissions: Commission[] = [];

    try {
        const response = await api.get(`/commissions/user/${user.id}`, {
            headers: { Cookie: cookieHeader }
        });
        commissions = response.data;
    } catch (error) {
        console.error("[Client Dashboard Loader] Ошибка:", error);
    }

    const totalCount = commissions.length;
    const postedCount = commissions.filter(c => c.commissionProgress === "POSTED").length;
    const completedCount = commissions.filter(c => c.commissionProgress === "COMPLETED").length;

    return {
        user,
        commissions,
        stats: {
            total: totalCount,
            posted: postedCount,
            completed: completedCount
        }
    };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const cookieHeader = request.headers.get("Cookie");

    const result = createCommissionSchema.safeParse(data);

    if (!result.success) {
        return {
            success: false,
            fieldErrors: result.error.flatten().fieldErrors,
            error: null,
        };
    }

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
        console.error("[Dashboard Action] Ошибка создания заказа:", error.message);
        return {
            success: false,
            fieldErrors: null,
            error: error.response?.data?.message || "Бэкенд недоступен или вернул ошибку"
        };
    }
}

// 🔥 Убрали дубликаты заглушек loader и action, которые ломали билд

export default function ClientDashboard() {
    const { user, commissions, stats } = useLoaderData<typeof loader>();
    const fetcher = useFetcher<typeof action>();
    const actionData = fetcher.data;

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        if (fetcher.data) {
            fetcher.data = undefined;
        }
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (actionData?.success) {
            setIsModalOpen(false);
        }
    }, [actionData]);

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Панель управления заказами</h1>
                        <p className="text-xs text-slate-500 mt-1">Добро пожаловать, <span className="font-semibold text-slate-700">{user.displayedName}</span></p>
                    </div>
                    <Button onClick={handleOpenModal} className="gap-2 shadow-sm">
                        <PlusCircle className="w-4 h-4" /> Создать заказ
                    </Button>
                </div>

                {actionData?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 mb-6 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Заказ успешно опубликован!
                    </div>
                )}

                {/* Блоки статистики */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-slate-100 text-slate-700 rounded-lg">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Всего проектов</div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <FolderKanban className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Открыто / Ищут</div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.posted}</div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Завершено</div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.completed}</div>
                        </div>
                    </div>
                </div>

                {/* Таблица проектов */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Название</th>
                            <th className="p-4 font-semibold text-slate-600">Статус</th>
                            <th className="p-4 font-semibold text-slate-600">Бюджет</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">Действие</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {commissions.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400 italic">У вас еще нет созданных проектов.</td>
                            </tr>
                        ) : (
                            commissions.map((c) => {
                                const statusLabel = COMMISSION_PROGRESS_LABELS[c.commissionProgress] || c.commissionProgress;
                                const statusColor = getStatusStyles(c.commissionProgress);
                                return (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-900">
                                            <Link to={`/commissions/${c.id}`} className="hover:text-blue-600 hover:underline">{c.title}</Link>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md font-bold uppercase text-[9px] tracking-wider border ${statusColor}`}>{statusLabel}</span>
                                        </td>
                                        <td className="p-4 font-semibold text-slate-700">{c.budgetMin} $</td>
                                        <td className="p-4 text-right">
                                            <Link to={`/commissions/${c.id}`} className="inline-flex items-center gap-1 text-slate-900 font-bold hover:text-blue-600 transition-colors">
                                                Управление <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                <CreateCommissionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    fetcher={fetcher}
                />
            </div>
        </div>
    );
}