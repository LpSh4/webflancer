import { Link, Form, useLocation } from "react-router";
import { Logo } from "~/shared/ui/Logo";
import type {UserProfile} from "~/features/user/shared/model";

interface NavbarProps {
    user?: UserProfile | null;
}

export function Navbar({ user }: NavbarProps) {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur">
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

                {/* ЛЕВАЯ ЧАСТЬ: Логотип и ссылки */}
                <div className="flex items-center space-x-8">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <Logo size="sm" />
                    </Link>

                    {user && (
                        <nav className="hidden md:flex items-center space-x-1">
                            <Link
                                to="/commissions"
                                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                    isActive("/commissions")
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                }`}
                            >
                                {user.role === "DEVELOPER" ? "Лента заказов" : "Мои заказы"}
                            </Link>

                            <Link
                                to={user.role === "DEVELOPER" ? "/developer/dashboard" : "/client/dashboard"}
                                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                    isActive("/developer/dashboard") || isActive("/client/dashboard")
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                }`}
                            >
                                Кабинет
                            </Link>
                        </nav>
                    )}
                </div>

                {/* ПРАВАЯ ЧАСТЬ: Профиль или Вход/Регистрация */}
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            {/* Слот авторизованного юзера */}
                            <Link to="/profile" className="flex items-center space-x-2 group">
                                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 overflow-hidden group-hover:border-slate-300 transition-colors">
                                    {/* Берем только первую букву имени */}
                                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <div className="text-[11px] font-semibold text-slate-800 leading-none group-hover:text-slate-900">
                                        {user.name}
                                    </div>
                                    <div className="text-[9px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">
                                        {user.role === "DEVELOPER" ? "Фрилансер" : "Заказчик"}
                                    </div>
                                </div>
                            </Link>

                            <div className="h-4 w-px bg-slate-200" />

                            {/* Форма выхода ведет на /logout */}
                            <Form method="post" action="/logout" className="flex items-center">
                                <button type="submit" className="text-[11px] font-medium text-slate-400 hover:text-red-600 px-2 py-1 rounded transition-colors cursor-pointer">
                                    Выйти
                                </button>
                            </Form>
                        </>
                    ) : (
                        <>
                            {/* Слот гостя */}
                            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors">
                                Войти
                            </Link>
                            <Link to="/register" className="text-sm font-medium bg-slate-900 text-white rounded-lg px-4 py-1.5 hover:bg-slate-800 transition-colors">
                                Регистрация
                            </Link>
                        </>
                    )}
                </div>

            </div>
        </header>
    );
}