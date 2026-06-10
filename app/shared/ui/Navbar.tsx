import { Link, Form, useLocation, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { Logo } from "~/shared/ui/Logo";
import type { UserProfile } from "~/features/user/shared/model";
import { UserAvatar } from "~/shared/ui/UserAvatar"; // 🔥 Подключаем наш прокачанный аватар
import {
    Bell, LogOut, User as UserIcon, Star,
    Briefcase, Send, CheckCircle2, AlertCircle, CheckCheck
} from "lucide-react";
import { apiClient } from "~/shared/utils/api.client";
import { getSocket } from "~/shared/utils/socket.client"; // Подключаем сокеты

interface NavbarProps {
    user?: UserProfile | null;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: "REVIEW_UPDATE" | "COMMISSION_UPDATE" | "BID_UPDATE" | "PROPOSAL_UPDATE" | "SYSTEM";
    actionUrl?: string | null;
    isRead: boolean;
    createdAt: string;
}

export function Navbar({ user }: NavbarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path: string) => location.pathname === path;

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Подключение к сокетам и загрузка истории
    useEffect(() => {
        if (!user) return;

        // 1. Грузим старые уведомления
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const res = await apiClient.get('/notifications');
                setNotifications(res.data);
            } catch (error) {
                console.error("Ошибка загрузки уведомлений:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();

        // 2. Слушаем новые в реальном времени
        const socket = getSocket();
        socket.connect();

        const handleNewNotification = (notification: AppNotification) => {
            console.log("🔔 ПРИШЛО УВЕДОМЛЕНИЕ:", notification);
            setNotifications(prev => [notification, ...prev]);
        };

        socket.on("new_notification", handleNewNotification);

        return () => {
            socket.off("new_notification", handleNewNotification);
        };
    }, [user]);

    // Закрытие меню по клику вне области
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsNotifOpen(false);
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getNotificationIcon = (type: AppNotification["type"]) => {
        switch (type) {
            case "REVIEW_UPDATE": return <Star className="w-5 h-5 text-amber-500" />;
            case "COMMISSION_UPDATE": return <Briefcase className="w-5 h-5 text-blue-500" />;
            case "BID_UPDATE": return <Send className="w-5 h-5 text-emerald-500" />;
            case "PROPOSAL_UPDATE": return <CheckCircle2 className="w-5 h-5 text-purple-500" />;
            default: return <AlertCircle className="w-5 h-5 text-slate-400" />;
        }
    };

    const handleNotificationClick = async (n: AppNotification) => {
        setIsNotifOpen(false);

        if (!n.isRead) {
            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
            try {
                await apiClient.patch(`/notifications/read/${n.id}`);
            } catch (error) {
                console.error("Не удалось прочитать", error);
            }
        }

        if (n.actionUrl) {
            navigate(n.actionUrl);
        }
    };

    const handleMarkAllRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await apiClient.patch('/notifications/read-all');
        } catch (error) {
            console.error("Ошибка при прочтении", error);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur">
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

                <div className="flex items-center space-x-8">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <Logo size="sm" />
                    </Link>

                    {user && (
                        <nav className="hidden md:flex items-center space-x-1">
                            <Link to="/commissions" className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${isActive("/commissions") ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
                                {user.role === "DEVELOPER" ? "Лента заказов" : "Мои заказы"}
                            </Link>
                            <Link to={user.role === "DEVELOPER" ? "/developer/dashboard" : "/client/dashboard"} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${isActive("/developer/dashboard") || isActive("/client/dashboard") ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
                                Кабинет
                            </Link>
                        </nav>
                    )}
                </div>

                <div className="flex items-center space-x-3" ref={dropdownRef}>
                    {user ? (
                        <>
                            <div className="relative">
                                <button onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }} className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none">
                                    <div className="hidden sm:block text-right">
                                        <div className="text-[11px] font-semibold text-slate-800 leading-none">{user.name}</div>
                                        <div className="text-[9px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">{user.role === "DEVELOPER" ? "Фрилансер" : "Заказчик"}</div>
                                    </div>

                                    {/* 🔥 Внедряем наш умный аватар вместо старого div */}
                                    <UserAvatar
                                        name={user.name}
                                        src={(user as any).profilePicture} // Приведение к any на случай, если поле временно отсутствует в типах UserProfile
                                        lastOnline={(user as any).lastOnline}
                                        showStatus={true}
                                        size={32}
                                    />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 overflow-hidden">
                                        <Link onClick={() => setIsProfileOpen(false)} to={`/profile`} className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                            <UserIcon className="w-4 h-4" /> Мой профиль
                                        </Link>
                                        <div className="h-px bg-slate-100 my-1" />
                                        <Form method="post" action="/logout" className="w-full">
                                            <button type="submit" className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left">
                                                <LogOut className="w-4 h-4" /> Выйти из аккаунта
                                            </button>
                                        </Form>
                                    </div>
                                )}
                            </div>

                            <div className="h-5 w-px bg-slate-200 mx-1" />

                            <div className="relative">
                                <button onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }} className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100 focus:outline-none">
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                    )}
                                </button>

                                {isNotifOpen && (
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 flex flex-col max-h-[80vh]">
                                        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                            <span className="text-xs font-bold text-slate-900">Уведомления</span>
                                            {unreadCount > 0 && (
                                                <button onClick={handleMarkAllRead} className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1">
                                                    <CheckCheck className="w-3.5 h-3.5" /> Прочитать все
                                                </button>
                                            )}
                                        </div>

                                        <div className="overflow-y-auto custom-scrollbar">
                                            {isLoading ? (
                                                <div className="p-8 text-center text-xs text-slate-400">Загрузка...</div>
                                            ) : notifications.length === 0 ? (
                                                <div className="p-10 flex flex-col items-center justify-center text-center">
                                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                                        <Bell className="text-slate-300 w-6 h-6" />
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-medium">Нет новых уведомлений</p>
                                                </div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div
                                                        key={notif.id}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`p-4 border-b border-slate-50 flex gap-3 cursor-pointer transition-colors ${
                                                            notif.isRead ? "hover:bg-slate-50 opacity-70" : "bg-blue-50/40 hover:bg-blue-50/80"
                                                        }`}
                                                    >
                                                        <div className="mt-1 shrink-0">
                                                            {getNotificationIcon(notif.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <p className={`text-xs truncate pr-2 ${notif.isRead ? "text-slate-600 font-medium" : "text-slate-900 font-bold"}`}>
                                                                    {notif.title}
                                                                </p>
                                                                <p className="text-[9px] text-slate-400 font-medium shrink-0">
                                                                    {new Date(notif.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                                                                {notif.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
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