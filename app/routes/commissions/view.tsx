import { useLoaderData, Link } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/view";
import { BidCard } from "~/features/bid/ui/BidCard";
import { CreateBidForm } from "~/features/bid/ui/CreateBidForm";

type CheckedUser = {
    displayedName: string;
    role: "DEVELOPER" | "CLIENT";
};

// Мокаем один детальный заказ
const dummySingleCommission = {
    id: "comm-1",
    title: "Landing Page для крипто-стартапа на React",
    description: "Нужно сверстать чистый, минималистичный лендинг по готовому макету из Figma. Обязательно использование Tailwind CSS и плавной анимации (Framer Motion). Срок сжатый, бэкенд не нужен. Оплата по факту выполнения, либо через безопасную сделку гаранта.",
    commissionType: "LANDING_PAGE",
    commissionProgress: "POSTED",
    budgetMin: 300,
    budgetMax: 500,
    createdAt: "2026-05-18T12:00:00.000Z",
    clientId: "client-99",
    clientName: "CryptoWhale Inc."
};

// Начальные фейковые отклики
const dummyBids = [
    {
        id: "bid-1",
        developerName: "Дмитрий Фронтендер",
        price: 400,
        days: 4,
        comment: "Отличный таск, сделаю всё на Tailwind v4 и Next.js. Анимации будут летать. Моё портфолио открыто.",
        createdAt: "2026-05-19T10:00:00.000Z"
    }
];

export async function loader({ request }: Route.LoaderArgs) {
    // Берём того же тестового юзера из root, чтобы роли совпадали
    const user: CheckedUser = {
        displayedName: "Алексей Разработчик",
        role: "DEVELOPER"
    };
    return { user, commission: dummySingleCommission, initialBids: dummyBids };
}

export default function CommissionViewPage() {
    const { user, commission, initialBids } = useLoaderData() as { user: CheckedUser, commission: typeof dummySingleCommission, initialBids: typeof dummyBids };
    const [bids, setBids] = useState(initialBids);

    const handleBidSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const newBid = {
            id: `bid-${Date.now()}`,
            developerName: user.displayedName,
            price: Number(formData.get("price")),
            days: Number(formData.get("days")),
            comment: formData.get("comment") as string,
            createdAt: new Date().toISOString()
        };

        setBids([newBid, ...bids]);
        e.currentTarget.reset();
    };

    return (
        <div className="flex-1 bg-slate-50 min-h-screen py-10">
            <div className="max-w-6xl mx-auto px-6">

                {/* Кнопка назад */}
                <Link to="/commissions" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-slate-900 mb-6 transition-colors">
                    ← Назад к заказам
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* ЛЕВАЯ СТОРОНА: Информация о проекте + список ставок */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Главная карточка ТЗ */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />

                            <div className="flex justify-between items-center gap-4 mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                                    {commission.commissionType.replace("_", " ")}
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                    {commission.budgetMax ? `${commission.budgetMin} — ${commission.budgetMax} $` : `от ${commission.budgetMin} $`}
                                </span>
                            </div>

                            <h1 className="text-xl font-black text-slate-900 tracking-tight">{commission.title}</h1>

                            <div className="text-[11px] text-slate-400 font-medium mt-1 flex gap-3">
                                <span>Заказчик: <strong className="text-slate-600">{commission.clientName}</strong></span>
                                <span>•</span>
                                <span>Опубликовано: {new Date(commission.createdAt).toLocaleDateString("ru-RU")}</span>
                            </div>

                            <div className="h-px bg-slate-100 my-4" />

                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Техническое задание:</h3>
                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                {commission.description}
                            </p>
                        </div>

                        {/* Секция откликов */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between px-1">
                                <span>Отклики исполнителей</span>
                                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">{bids.length}</span>
                            </h2>

                            {bids.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                                    На этот проект пока никто не откликался. Стань первым!
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bids.map((bid) => (
                                        <BidCard key={bid.id} bid={bid} />
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* ПРАВАЯ СТОРОНА: Форма подачи ставки (Только для фрилансеров) */}
                    <div>
                        {(user.role as string) === "DEVELOPER" ? (
                            <CreateBidForm onSubmit={handleBidSubmit} />
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center text-slate-400 text-xs">
                                Вы вошли как заказчик этого проекта. Вы можете просматривать отклики разработчиков в левой панели приложения.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}