import { useLoaderData, useFetcher, Link } from "react-router";
import type { Route } from "./+types/workspace";

// Типы статусов из твоего бэка
enum CommissionWorkStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    REVIEW = "REVIEW",
    COMPLETED = "COMPLETED"
}

export async function loader({ params }: Route.LoaderArgs) {
    // В реальности: await proposalService.findById(params.id, userId);
    return {
        proposal: {
            id: params.id,
            status: CommissionWorkStatus.IN_PROGRESS,
            title: "Landing Page для крипто-стартапа",
            client: "Иван Заказчиков",
            developer: "Алексей Разработчик",
            budget: 450
        }
    };
}

export default function WorkspacePage() {
    const { proposal } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();

    const changeStatus = (newStatus: CommissionWorkStatus) => {
        fetcher.submit(
            { id: proposal.id, status: newStatus },
            { method: "post", action: "/api/proposal/status" } // Твой путь к proposalController
        );
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-xl font-bold">{proposal.title}</h1>
                        <p className="text-xs text-slate-500">Сделка с {proposal.client}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
                        {proposal.status}
                    </span>
                </div>

                {/* Блок переключения статусов */}
                <div className="flex gap-3">
                    {proposal.status !== CommissionWorkStatus.COMPLETED && (
                        <button
                            onClick={() => changeStatus(CommissionWorkStatus.COMPLETED)}
                            className="bg-slate-900 text-white text-xs px-4 py-2 rounded-lg font-bold"
                        >
                            Завершить работу
                        </button>
                    )}
                    <Link
                        to={`/chat/${proposal.id}`}
                        className="border border-slate-200 text-slate-600 text-xs px-4 py-2 rounded-lg font-medium hover:bg-slate-50"
                    >
                        Написать в чат
                    </Link>
                </div>
            </div>
        </div>
    );
}