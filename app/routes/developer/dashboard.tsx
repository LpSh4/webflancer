import { useLoaderData } from "react-router";
import type { Route } from "./+types/developer/dashboard";

// Типизация данных от твоего API
interface Bid {
    id: string;
    targetId: string; // ID заказа
    status: string;
    proposedBudget: number;
    createdAt: string;
}

export async function loader({ request }: Route.LoaderArgs) {
    // В реальном приложении здесь будет авторизация и получение токена
    // const user = await getAuthUser(request);

    // Делаем запросы к твоему API (через внутренний fetch или axios)
    // const [myBids, myActiveCommissions] = await Promise.all([
    //     fetch(`${process.env.API_URL}/bid/user/${user.id}`).then(res => res.json()),
    //     fetch(`${process.env.API_URL}/commission/user/${user.id}`).then(res => res.json())
    // ]);

    return {
        bids: [], // Тут будут данные из API
        stats: { active: 3, completed: 12 }
    };
}

export default function DeveloperDashboard() {
    const { bids, stats } = useLoaderData<typeof loader>();

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Мой дашборд</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <div className="text-sm text-slate-500">Активных откликов</div>
                    <div className="text-3xl font-black">{stats.active}</div>
                </div>
                {/* Другие карточки статы */}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-100 font-bold">Последние отклики</div>
                {bids.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Пока нет откликов</div>
                ) : (
                    // Рендер списка откликов
                    <div>Список...</div>
                )}
            </div>
        </div>
    );
}