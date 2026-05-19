import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/client/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
    // В будущем тут будет вызов:
    // const commissions = await commissionService.getUserCommissions(user.id);
    // Пока мокаем структуру, которую возвращает твой бэк:
    return {
        myCommissions: [
            {
                id: "comm-1",
                title: "Landing Page для крипто-стартапа",
                status: "POSTED",
                bidsCount: 5,
                createdAt: "2026-05-18"
            }
        ]
    };
}

export default function ClientDashboard() {
    const { myCommissions } = useLoaderData<typeof loader>();

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Панель управления заказами</h1>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Название</th>
                            <th className="p-4 font-semibold text-slate-600">Статус</th>
                            <th className="p-4 font-semibold text-slate-600">Отклики</th>
                            <th className="p-4 font-semibold text-slate-600">Действие</th>
                        </tr>
                        </thead>
                        <tbody>
                        {myCommissions.map((c) => (
                            <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-4 font-medium">{c.title}</td>
                                <td className="p-4">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold uppercase text-[10px]">
                                            {c.status}
                                        </span>
                                </td>
                                <td className="p-4 font-bold text-slate-700">{c.bidsCount}</td>
                                <td className="p-4">
                                    <Link
                                        to={`/commissions/${c.id}`}
                                        className="text-slate-900 font-bold hover:underline"
                                    >
                                        Управление →
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}