import React, {type ReactNode} from "react";
import {useState, useEffect, useRef, useMemo} from "react";
import {RiNotification3Line} from 'react-icons/ri';
import {
    IoCheckmarkDoneOutline,
    IoChatbubbleEllipsesOutline,
    IoClipboardOutline,
    IoRocketOutline,
    IoInformationCircleOutline,
    IoTrashOutline,
    IoChevronDownOutline
} from "react-icons/io5";
import {getSocket} from "~/shared/utils/socket.client";
import {apiClient} from "~/shared/utils/api.client";
import type {AppNotification} from "~/features/notification/model";
import {useNavigate} from "react-router";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
    token?: string;
}

export function PageHeader({title, subtitle, children, token}: PageHeaderProps) {
    return (
        <header
            className="relative z-100 h-20 flex items-center justify-between pl-16 pr-4 sm:pl-20 sm:pr-10 lg:px-10 shrink-0 border-b border-blue-900/30 bg-[#020817]/60 backdrop-blur-md">
            <div className="min-w-0 flex-1 mr-4">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                    {title}
                </h2>
                {subtitle && (
                    <div
                        className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate">
                        {subtitle}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {children}
                <NotificationButton token={token}/>
            </div>
        </header>
    );
}

// 🔥 Типы для группировки
type DisplayItem =
    | { type: 'single'; data: AppNotification }
    | { type: 'group'; chatId: string; items: AppNotification[]; latest: AppNotification };

function NotificationButton({token}: { token?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // 🔥 Стейт для открытых групп сообщений
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const dropdownRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const fetchNotifications = async (pageNum: number, isInitial = false) => {
        if (!token || isLoading || (!hasMore && !isInitial)) return;
        setIsLoading(true);
        try {
            const res = await apiClient.get(`/notifications?page=${pageNum}&limit=20`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            const newNotifs = res.data.data || res.data;
            setNotifications(prev => isInitial ? newNotifs : [...prev, ...newNotifs]);
            setHasMore(newNotifs.length === 20);
            setPage(pageNum);
        } catch (e) {
            console.error("Ошибка загрузки уведомлений", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(1, true);
    }, [token]);

    const handleScroll = () => {
        if (listRef.current) {
            const {scrollTop, scrollHeight, clientHeight} = listRef.current;
            if (scrollHeight - scrollTop <= clientHeight + 10) {
                fetchNotifications(page + 1);
            }
        }
    };

    useEffect(() => {
        if (!token) return;
        const socket = getSocket(token);
        socket.connect();

        const handleNewNotification = (notification: AppNotification) => {
            setNotifications((prev) => [notification, ...prev]);
        };

        socket.on("new_notification", handleNewNotification);
        return () => {
            socket.off("new_notification", handleNewNotification);
        };
    }, [token]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = (id: string) => {
        if (!token) return;
        setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n));
        const socket = getSocket(token);
        socket.emit("mark_notification_read", {notificationId: id});
    };

    const handleMarkAllRead = async () => {
        if (!token) return;
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
        try {
            await apiClient.post('/notifications/read-all', {}, {headers: {Authorization: `Bearer ${token}`}});
        } catch (e) {
            console.error("Ошибка при прочтении", e);
        }
    };

    // 🔥 Удаление одного уведомления
    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
        try {
            await apiClient.delete(`/notifications/${id}`, {headers: {Authorization: `Bearer ${token}`}});
        } catch (e) {
            console.error("Ошибка удаления", e);
        }
    };

    // 🔥 Удаление всей группы чата
    const handleDeleteGroup = async (e: React.MouseEvent, ids: string[]) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
        try {
            await Promise.all(ids.map(id => apiClient.delete(`/notifications/${id}`, {headers: {Authorization: `Bearer ${token}`}})));
        } catch (e) {
            console.error("Ошибка удаления группы", e);
        }
    };

    const toggleGroup = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(chatId)) next.delete(chatId);
            else next.add(chatId);
            return next;
        });
    };

    const getNotificationLink = (n: AppNotification) => {
        if (n.taskId) return `/tasks/${n.taskId}`;
        const titleLower = n.title.toLowerCase();
        if (titleLower.includes('программ') || titleLower.includes('этап')) return `/onboarding/stages`;
        if (titleLower.includes('наставник')) return `/users/my-mentor`;

        const targetChatId = n.chatId || (n as any).chat?.id || (n as any).chat;

        if (n.type === 'message' || titleLower.includes('групп') || targetChatId) {
            return targetChatId ? `/chat?chatId=${targetChatId}` : `/chat`;
        }
        return null;
    };
    const getNotificationIcon = (n: AppNotification) => {
        if (n.type === 'message') return <IoChatbubbleEllipsesOutline className="text-blue-400" size={20}/>;
        const titleLower = n.title.toLowerCase();
        if (titleLower.includes('задач') || titleLower.includes('проверк')) return <IoClipboardOutline
            className="text-emerald-400" size={20}/>;
        if (titleLower.includes('этап') || titleLower.includes('программ')) return <IoRocketOutline
            className="text-purple-400" size={20}/>;
        return <IoInformationCircleOutline className="text-slate-400" size={20}/>;
    };

    const handleNotificationClick = (n: AppNotification) => {
        if (!n.isRead) handleMarkAsRead(n.id);
        const link = getNotificationLink(n);
        if (link) {
            setIsOpen(false);
            navigate(link);
        }
    };

    const displayItems = useMemo<DisplayItem[]>(() => {
        const result: DisplayItem[] = [];
        const chatGroups = new Map<string, { items: AppNotification[] }>();

        notifications.forEach(n => {
            const cId = n.chatId || (n as any).chat?.id || (n as any).chat;

            if (n.type === 'message' && cId) {
                if (chatGroups.has(cId)) {
                    chatGroups.get(cId)!.items.push(n);
                } else {
                    const items = [n];
                    chatGroups.set(cId, {items});
                    result.push({type: 'group', chatId: cId, items, latest: n});
                }
            } else {
                result.push({type: 'single', data: n});
            }
        });

        // Если в группе всего 1 сообщение, превращаем её обратно в одиночное
        return result.map(item => {
            if (item.type === 'group' && item.items.length === 1) {
                return {type: 'single', data: item.items[0]};
            }
            return item;
        });
    }, [notifications]);

    // Компонент одного уведомления
    const renderSingleNotification = (n: AppNotification, isNested = false) => {
        const hasLink = !!getNotificationLink(n);
        return (
            <div
                key={n.id}
                className={`relative p-3 sm:p-4 rounded-xl transition-all flex gap-4 group/item ${
                    n.isRead ? 'opacity-70 hover:opacity-100 hover:bg-white/4' : 'bg-blue-900/10 hover:bg-blue-900/20'
                } ${hasLink ? 'cursor-pointer' : ''} ${isNested ? 'bg-transparent border border-white/5 ml-4' : ''}`}
                onClick={() => handleNotificationClick(n)}
            >
                {!n.isRead && (
                    <div
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"/>
                )}
                <div
                    className="w-10 h-10 rounded-full bg-black/20 border border-white/5 flex items-center justify-center shrink-0">
                    {getNotificationIcon(n)}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center pr-6">
                    <div className="flex justify-between items-start mb-0.5">
                        <span
                            className={`text-[13px] font-bold truncate pr-2 ${n.isRead ? 'text-slate-300' : 'text-white'}`}>
                            {n.title}
                        </span>
                        <span className="text-[9px] text-slate-500 font-medium shrink-0 mt-0.5">
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : ''}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{n.content}</p>
                </div>

                {/* 🔥 Кнопка удаления при наведении */}
                <button
                    onClick={(e) => handleDelete(e, n.id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg opacity-0 group-hover/item:opacity-100 transition-all shadow-lg"
                    title="Удалить уведомление"
                >
                    <IoTrashOutline size={14}/>
                </button>
            </div>
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 sm:w-12 sm:h-12 glass-panel rounded-xl sm:rounded-2xl flex items-center justify-center transition-all group cursor-pointer shrink-0 relative ${isOpen ? 'text-blue-400 border-blue-500/50 bg-white/5' : 'text-slate-400 hover:text-blue-400 hover:border-blue-500/50'}`}
            >
                <RiNotification3Line size={18}/>
                {unreadCount > 0 && (
                    <span
                        className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e] border-2 border-[#020817] animate-pulse"/>
                )}
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-3 w-85 sm:w-100 max-w-[calc(100vw-2rem)] bg-[#0a1428]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col z-200 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/2">
                        <h3 className="text-sm font-black text-white tracking-wide">Уведомления</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer bg-blue-500/10 px-2.5 py-1 rounded-lg">
                                <IoCheckmarkDoneOutline size={14}/> Прочитать всё
                            </button>
                        )}
                    </div>

                    <div ref={listRef} onScroll={handleScroll}
                         className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 space-y-1.5">
                        {displayItems.length === 0 && !isLoading ? (
                            <div className="p-10 flex flex-col items-center justify-center text-center">
                                <div
                                    className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                    <RiNotification3Line className="text-slate-600" size={24}/>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">Нет новых уведомлений</p>
                            </div>
                        ) : (
                            displayItems.map((item, idx) => {
                                // Одиночное уведомление
                                if (item.type === 'single') {
                                    return renderSingleNotification(item.data);
                                }

                                // Тут TypeScript уже на 100% знает, что item.type === 'group',
                                // и item.chatId, item.items точно существуют!
                                const isExpanded = expandedGroups.has(item.chatId);
                                const hasUnreadInGroup = item.items.some(i => !i.isRead);
                                return (
                                    <div key={`group-${item.chatId}-${idx}`} className="space-y-1">
                                        <div
                                            onClick={(e) => toggleGroup(e, item.chatId)}
                                            className={`relative p-3 sm:p-4 rounded-xl transition-all flex items-center gap-4 cursor-pointer group/folder border border-white/5 ${hasUnreadInGroup ? 'bg-blue-900/20' : 'bg-black/20 hover:bg-white/4'}`}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                                                <IoChatbubbleEllipsesOutline size={20}/>
                                            </div>
                                            <div className="flex-1 min-w-0 pr-6">
                                                <div
                                                    className="text-[13px] font-bold text-white truncate">{item.latest.title}</div>
                                                <div className="text-[11px] text-blue-400 font-medium mt-0.5">
                                                    {item.items.length} новых сообщений
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => handleDeleteGroup(e, item.items.map(i => i.id))}
                                                    className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg opacity-0 group-hover/folder:opacity-100 transition-all shadow-lg"
                                                    title="Удалить все сообщения чата"
                                                >
                                                    <IoTrashOutline size={14}/>
                                                </button>
                                                <IoChevronDownOutline
                                                    className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                    size={18}/>
                                            </div>
                                        </div>

                                        {/* Раскрытые уведомления группы */}
                                        <div
                                            className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <div className="overflow-hidden space-y-1">
                                                {item.items.map(n => renderSingleNotification(n, true))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {isLoading && (
                            <div className="py-4 flex justify-center">
                                <div
                                    className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}