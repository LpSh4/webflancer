import { Link, Form, useLocation } from "react-router";
import { useState } from "react";
import { Logo } from "~/shared/ui/Logo";
import type { UserProfile } from "~/features/user/shared/model";
import { Bell, LogOut, User as UserIcon, Settings } from "lucide-react";

interface NavbarProps {
    user?: UserProfile | null;
}

// Заглушка для уведомлений
const dummyNotifications = [
    { id: 1, text: "Ваш отклик на проект 'Лендинг' принят!", time: "5 мин назад", unread: true },
    { id: 2, text: "Новое сообщение в рабочей области", time: "1 час назад", unread: false }
];

export function Navbar({ user }: NavbarProps) {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // Считаем непрочитанные для красной точки
    const unreadCount = dummyNotifications.filter(n => n.unread).length;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur">
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

                {/* ЛЕВАЯ ЧАСТЬ */}
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

                {/* ПРАВАЯ ЧАСТЬ */}
                <div className="flex items-center space-x-3">
                    {user ? (
                        <>
                            {/* ПРОФИЛЬ */}
                            <div className="relative">
                                <button
                                    onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
                                >
                                    <div className="hidden sm:block text-right">
                                        <div className="text-[11px] font-semibold text-slate-800 leading-none">
                                            {user.name}
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">
                                            {user.role === "DEVELOPER" ? "Фрилансер" : "Заказчик"}
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
                                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                    </div>
                                </button>

                                {/* Выпадающее меню профиля */}
                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 overflow-hidden">
                                            <Link onClick={() => setIsProfileOpen(false)} to="/profile" className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                                <UserIcon className="w-4 h-4" /> Настройки профиля
                                            </Link>
                                            <div className="h-px bg-slate-100 my-1" />
                                            <Form method="post" action="/logout" className="w-full">
                                                <button type="submit" className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left">
                                                    <LogOut className="w-4 h-4" /> Выйти из аккаунта
                                                </button>
                                            </Form>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="h-5 w-px bg-slate-200 mx-1" />

                            {/* УВЕДОМЛЕНИЯ */}
                            <div className="relative">
                                <button
                                    onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                                    className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100 focus:outline-none"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                    )}
                                </button>

                                {/* Выпадающее меню уведомлений */}
                                {isNotifOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                                            <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-900">Уведомления</span>
                                                <span className="text-[10px] text-blue-600 cursor-pointer hover:underline">Прочитать все</span>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {dummyNotifications.map(notif => (
                                                    <div key={notif.id} className={`p-4 border-b border-slate-50 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${notif.unread ? "bg-blue-50/30" : ""}`}>
                                                        <p className={`mb-1 ${notif.unread ? "text-slate-900 font-semibold" : "text-slate-600"}`}>
                                                            {notif.text}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">{notif.time}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors">Войти</Link>
                            <Link to="/register" className="text-sm font-medium bg-slate-900 text-white rounded-lg px-4 py-1.5 hover:bg-slate-800 transition-colors">Регистрация</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}