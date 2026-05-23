import {useLoaderData, Link} from "react-router";
import type {Route} from "./+types/dashboard";
import {getUser} from "~/shared/utils/auth.server";
import {api} from "~/shared/utils/api.server";
import {FolderKanban, CheckCircle2, LayoutGrid, ArrowRight} from "lucide-react";

interface Commission {
    id: string;
    title: string;
    commissionType: string;
    commissionProgress: string;
    budgetMin: number;
    createdAt: string;
}

export async function loader({request}: Route.LoaderArgs) {
    const {user} = await getUser(request);
    const cookieHeader = request.headers.get("Cookie");

    let commissions: Commission[] = [];

    try {
        const response = await api.get(`/commissions/user/${user.id}`, {
            headers: {Cookie: cookieHeader}
        });
        commissions = response.data;
    } catch (error) {
        console.error("[Client Dashboard Loader] Ошибка:", error);
    }

    // Считаем реальную статистику по проектам клиента
    const totalCount = commissions.length;
    const postedCount = commissions.filter(c => c.commissionProgress === "POSTED").length;
    const completedCount = commissions.filter(c => c.commissionProgress === "DEVELOPMENT_COMPLETE").length;

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

export default function ClientDashboard() {
    const {user, commissions, stats} = useLoaderData<typeof loader>();

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">

                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Панель управления заказами</h1>
                        <p className="text-xs text-slate-500 mt-1">Добро пожаловать, <span
                            className="font-semibold text-slate-700">{user.displayedName}</span></p>
                    </div>
                    <Link to="/commissions"
                          className="bg-slate-900 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                        + Создать заказ
                    </Link>
                </div>

                {/* Реальная статистика по массиву из базы */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-slate-100 text-slate-700 rounded-lg">
                            <LayoutGrid className="w-5 h-5"/>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Всего
                                проектов
                            </div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <FolderKanban className="w-5 h-5"/>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Открыто /
                                Ищут
                            </div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.posted}</div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle2 className="w-5 h-5"/>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Завершено
                            </div>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.completed}</div>
                        </div>
                    </div>
                </div>

                {/* Таблица текущих заказов */}
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
                                <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                                    У вас еще нет созданных проектов.
                                </td>
                            </tr>
                        ) : (
                            commissions.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-bold text-slate-900">
                                        <Link to={`/commissions/${c.id}`}
                                              className="hover:text-blue-600 hover:underline">
                                            {c.title}
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold uppercase text-[9px] border border-blue-100">
                                            {c.commissionProgress}
                                        </span>
                                    </td>
                                    <td className="p-4 font-semibold text-slate-700">{c.budgetMin} $</td>
                                    <td className="p-4 text-right">
                                        <Link
                                            to={`/commissions/${c.id}`}
                                            className="inline-flex items-center gap-1 text-slate-900 font-bold hover:underline"
                                        >
                                            Управление <ArrowRight className="w-3 h-3"/>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}