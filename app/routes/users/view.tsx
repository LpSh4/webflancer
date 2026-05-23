import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/view";
import { api } from "~/shared/utils/api.server";
import { Star, Building2, ArrowLeft, Briefcase, Globe } from "lucide-react";

interface PublicUserProfile {
    id: string;
    role: "DEVELOPER" | "CLIENT" | "MODERATOR";
    login: string;
    displayedName: string;
    name: string;
    surname?: string;
    profileStatus?: string;
    averageRating?: number;
    bio?: string;
    avgHourlyRate?: number;
    socialLinkedIn?: string;
    socialX?: string;
    socialGitHub?: string;
    portfolioLinks?: string[];
    companyName?: string;
    companyLink?: string;
}

export async function loader({ params, request }: Route.LoaderArgs) {
    const cookieHeader = request.headers.get("Cookie");

    try {
        const response = await api.get(`/users/${params.id}`, {
            headers: cookieHeader ? { Cookie: cookieHeader } : undefined
        });

        return { user: response.data as PublicUserProfile };
    } catch (error: any) {
        console.error(`[Public Profile Loader] Failed to fetch user ${params.id}:`, error.message);
        throw new Response("Пользователь не найден", { status: 404 });
    }
}

export default function PublicProfilePage() {
    const { user } = useLoaderData<typeof loader>();

    const firstLetter = user.displayedName ? user.displayedName.charAt(0).toUpperCase() : "U";
    const fullName = `${user.name} ${user.surname || ""}`.trim();

    return (
        <div className="flex-1 bg-slate-50 min-h-screen py-10">
            <div className="max-w-3xl mx-auto px-6">

                <Link
                    to="/commissions"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Назад к заказам
                </Link>

                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">

                    {/* Хедер профиля */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-8 pb-6 border-b border-slate-100">
                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-inner shrink-0">
                            {firstLetter}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user.displayedName}</h1>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">{fullName} (@{user.login})</p>

                            {user.profileStatus && (
                                <p className="text-xs text-slate-600 mt-2 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block">
                                    {user.profileStatus}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    user.role === "DEVELOPER"
                                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                }`}>
                                    {user.role === "DEVELOPER" ? "Разработчик" : "Заказчик"}
                                </span>

                                <span className="text-slate-900 font-bold text-xs flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">
                                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                    {user.averageRating ? Number(user.averageRating).toFixed(2) : "0.00"}
                                </span>

                                {user.role === "DEVELOPER" && user.avgHourlyRate && (
                                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                        {user.avgHourlyRate} $ / час
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">

                        {/* Блок "О себе" */}
                        {user.role === "DEVELOPER" && user.bio && (
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">О себе</h3>
                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    {user.bio}
                                </p>
                            </div>
                        )}

                        {/* Блок компании */}
                        {user.role === "CLIENT" && user.companyName && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Информация о компании</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-800 font-medium">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                    {user.companyName}
                                </div>
                                {user.companyLink && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <Globe className="w-4 h-4 text-slate-400" />
                                        <a href={user.companyLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                                            {user.companyLink}
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Социальные сети разработчика */}
                        {user.role === "DEVELOPER" && (user.socialGitHub || user.socialLinkedIn || user.socialX) && (
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Контакты и сети</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {user.socialGitHub && (
                                        <a href={user.socialGitHub} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                                            <svg className="w-4 h-4 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                                <path d="M9 18c-4.51 2-5-2-7-2" />
                                            </svg>
                                            GitHub
                                        </a>
                                    )}
                                    {user.socialLinkedIn && (
                                        <a href={user.socialLinkedIn} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                                            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                                <rect width="4" height="12" x="2" y="9" />
                                                <circle cx="4" cy="4" r="2" />
                                            </svg>
                                            LinkedIn
                                        </a>
                                    )}
                                    {user.socialX && (
                                        <a href={user.socialX} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                                            <svg className="w-4 h-4 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                                                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                                            </svg>
                                            X (Twitter)
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Портфолио */}
                        {user.role === "DEVELOPER" && user.portfolioLinks && user.portfolioLinks.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Портфолио</h3>
                                <div className="space-y-2">
                                    {user.portfolioLinks.map((link) => (
                                        <a
                                            key={link}
                                            href={link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 p-3 border border-slate-100 bg-slate-50/30 rounded-lg text-xs text-blue-600 font-medium hover:bg-slate-50 hover:text-blue-700 transition-all truncate"
                                        >
                                            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            {link}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Отзывы (Заглушка) */}
                        <div className="pt-8 border-t border-slate-100 mt-8">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Отзывы (2)
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-xs text-slate-900">Крипто Инвест</div>
                                        <div className="text-[10px] text-slate-400">12 мая 2026</div>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Сделал лендинг вовремя, правки внес без проблем. Рекомендую.
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-xs text-slate-900">Иван Петров</div>
                                        <div className="text-[10px] text-slate-400">01 апр 2026</div>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Всё супер! Качество кода отличное.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}