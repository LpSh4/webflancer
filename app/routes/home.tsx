import { redirect, Link } from "react-router";
import type { Route } from "./+types/home";
import { getUser } from "~/shared/utils/auth.server";
import { Logo } from "~/shared/ui/Logo";

export async function loader({ request }: Route.LoaderArgs) {
    try {
        const { user } = await getUser(request);

        // Распределяем потоки пользователей по их ролям
        if (user.role === 'CLIENT') {
            return redirect('/client/dashboard');
        }
        if (user.role === 'DEVELOPER') {
            return redirect('/developer/dashboard');
        }

        return redirect('/profile');
    } catch (error) {
        // Если токенов нет, просто остаемся на этой странице и показываем лендинг
        return null;
    }
}

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Навигационная панель */}
            <header className="border-b border-slate-100 px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
                <Logo size="sm" showSubtitle={false} className="items-start" />
                <div className="flex items-center space-x-4">
                    <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors">
                        Войти
                    </Link>
                    <Link to="/register" className="text-sm font-medium bg-slate-900 text-white rounded-lg px-4 py-1.5 hover:bg-slate-800 transition-colors">
                        Регистрация
                    </Link>
                </div>
            </header>

            {/* Главный контент */}
            <main className="flex-1 flex flex-col justify-center max-w-4xl mx-auto px-6 py-20 text-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 block">
                    Новый стандарт фриланса
                </span>
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-950 mb-6">
                    Экосистема безопасного взаимодействия заказчиков и разработчиков.
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Публикуйте технические задания, находите квалифицированных исполнителей, отслеживайте прогресс выполнения и управляйте ставками на одной чистой и быстрой платформе.
                </p>

                {/* Блок преимуществ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mt-4">
                    <div className="border border-slate-100 bg-slate-50/50 p-5 rounded-2xl">
                        <h3 className="font-semibold text-slate-900 text-sm mb-1">Для Клиентов</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Удобный менеджмент ваших заказов, детальные анкеты исполнителей и прозрачная система откликов.
                        </p>
                    </div>
                    <div className="border border-slate-100 bg-slate-50/50 p-5 rounded-2xl">
                        <h3 className="font-semibold text-slate-900 text-sm mb-1">Для Разработчиков</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Лента актуальных заказов, гибкая система ставок (bids) и ведение профиля с вашим стеком технологий.
                        </p>
                    </div>
                </div>
            </main>

            {/* Подвал */}
            <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
                © 2026 Webflancer Digital System. Все права защищены.
            </footer>
        </div>
    );
}