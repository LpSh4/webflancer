import { useLoaderData } from "react-router";
import type { Route } from "./+types/feed";
import { useState } from "react";
import type { UserProfile } from "~/features/user/shared/model";
import { CommissionCard } from "~/features/commission/ui/CommissionCard";
import { CommissionFilters } from "~/features/commission/ui/CommissionFilters"; // Импортируем фильтры

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

const dummyCommissions: Commission[] = [
    {
        id: "comm-1",
        title: "Landing Page для крипто-стартапа на React",
        description: "Нужно сверстать чистый, минималистичный лендинг по готовому макету из Figma. Обязательно использование Tailwind CSS и плавной анимации (Framer Motion). Срок сжатый, бэкенд не нужен.",
        commissionType: "LANDING_PAGE",
        commissionProgress: "POSTED",
        budgetMin: 300,
        budgetMax: 500,
        deadline: "2026-06-01",
        createdAt: "2026-05-18T12:00:00.000Z",
        clientId: "client-99"
    },
    {
        id: "comm-2",
        title: "Разработка маркетплейса цифровых товаров",
        description: "Ищем Fullstack-разработчика (Next.js + NestJS) для создания MVP маркетплейса. Нужно спроектировать БД, сделать авторизацию через JWT, интеграцию платежки и админ-панель.",
        commissionType: "MARKETPLACE",
        commissionProgress: "POSTED",
        budgetMin: 1500,
        budgetMax: 2500,
        deadline: "2026-07-15",
        createdAt: "2026-05-19T09:30:00.000Z",
        clientId: "client-some-id"
    },
    {
        id: "comm-3",
        title: "SaaS панель аналитики (Dashboard) для логистики",
        description: "Ваш таск — перенести готовые UI-компоненты на реальные графики (Chart.js / Recharts). Работа исключительно с фронтендом, мокаем данные через MSW или кастомные хуки.",
        commissionType: "SAAS_DASHBOARD",
        commissionProgress: "POSTED",
        budgetMin: 800,
        budgetMax: null,
        deadline: null,
        createdAt: "2026-05-15T15:45:00.000Z",
        clientId: "client-99"
    }
];

export async function loader({ request }: Route.LoaderArgs) {
    const user: UserProfile = {
        id: "user-777",
        role: "DEVELOPER", // Поменяй на "CLIENT" для проверки экрана Заказчика
        login: "alex_developer",
        email: "alex.dev@webflancer.ru",
        phoneNumber: "+79991112233",
        verifiedEmail: true,
        displayedName: "Алексей Разработчик",
        name: "Алексей",
        surname: "Иванов",
        profileStatus: "Работаю",
        averageRating: 4.95,
        lastOnline: new Date()
    };

    if (user.role === "DEVELOPER") {
        return { user, commissions: dummyCommissions };
    } else {
        const myCommissions = dummyCommissions.filter(c => c.clientId === "client-99");
        return { user, commissions: myCommissions };
    }
}

export default function CommissionsPage() {
    const { user, commissions: initialCommissions } = useLoaderData() as { user: UserProfile; commissions: Commission[] };
    const [commissions, setCommissions] = useState<Commission[]>(initialCommissions);

    // Стейты для реальной фильтрации на клиенте
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("ALL");

    const handleClientSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const newCommission: Commission = {
            id: `comm-${Date.now()}`,
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            commissionType: formData.get("commissionType") as string,
            commissionProgress: "POSTED",
            budgetMin: Number(formData.get("budgetMin")),
            budgetMax: formData.get("budgetMax") ? Number(formData.get("budgetMax")) : null,
            deadline: null,
            createdAt: new Date().toISOString(),
            clientId: "client-99"
        };

        setCommissions([newCommission, ...commissions]);
        e.currentTarget.reset();
    };

    // Логика фильтрации списка
    const filteredCommissions = commissions.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === "ALL" || item.commissionType === selectedType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="flex-1 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-10">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {user.role === "DEVELOPER" ? "Лента заказов" : "Мои заказы (Панель клиента)"}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Вы вошли как: <span className="font-semibold text-slate-700">{user.displayedName}</span> ({user.role === "DEVELOPER" ? "Разработчик" : "Заказчик"})
                        </p>
                    </div>
                </div>

                {/* Выводим панель фильтров над основным контентом */}
                <div className="mb-6">
                    <CommissionFilters onSearchChange={setSearchQuery} onTypeChange={setSelectedType} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ЛЕВАЯ ЧАСТЬ: Рендерим отфильтрованные карточки */}
                    <div className="lg:col-span-2 space-y-4">
                        {filteredCommissions.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                                Заказы не найдены. Попробуйте изменить параметры фильтра.
                            </div>
                        ) : (
                            filteredCommissions.map((item) => (
                                <CommissionCard key={item.id} commission={item} />
                            ))
                        )}
                    </div>

                    {/* ПРАВАЯ ЧАСТЬ: Боковая панель в зависимости от роли */}
                    <div className="space-y-6">
                        {user.role === "CLIENT" ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                                    Опубликовать новый заказ
                                </h2>
                                <form onSubmit={handleClientSubmit} className="space-y-3">
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Название проекта</label>
                                        <input type="text" name="title" required placeholder="Например: Landing Page для кофейни" className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50" />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Тип разработки</label>
                                        <select name="commissionType" className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50">
                                            <option value="LANDING_PAGE">Landing Page</option>
                                            <option value="MARKETPLACE">Marketplace</option>
                                            <option value="SAAS_DASHBOARD">SaaS Dashboard</option>
                                            <option value="TELEGRAM_BOT">Telegram Bot</option>
                                            <option value="WEB_APPLICATION">Web Application</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-500 mb-1">Мин. бюджет ($)</label>
                                            <input type="number" name="budgetMin" defaultValue={50} required className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-500 mb-1">Макс. бюджет ($)</label>
                                            <input type="number" name="budgetMax" placeholder="Необязательно" className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Техническое задание</label>
                                        <textarea name="description" rows={4} required placeholder="Опишите стек, требования и ожидаемый результат..." className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50 resize-none" />
                                    </div>

                                    <button type="submit" className="w-full text-xs bg-slate-900 text-white rounded-lg py-2.5 font-semibold hover:bg-slate-800 transition-colors mt-2 shadow-sm">
                                        Разместить заказ
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-slate-600 space-y-3">
                                <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Информация</h2>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Вы видите полную ленту заказов биржи. Нажмите на любой проект, чтобы перейти на страницу деталей и оставить свой отклик.
                                </p>
                                <div className="pt-2 border-t border-slate-100">
                                    <div className="text-[11px] font-medium text-slate-400 mb-1.5">Твой стек (тестовый):</div>
                                    <div className="flex flex-wrap gap-1">
                                        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">React</span>
                                        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">Tailwind CSS</span>
                                        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">TypeScript</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}