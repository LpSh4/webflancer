import { useSearchParams } from "react-router";
import { useState, useMemo } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";

// Выносим категории в константу для удобного поиска
const CATEGORY_GROUPS = [
    {
        label: "Простые сайты",
        options: [
            { value: "LANDING_PAGE", label: "Landing Page" },
            { value: "PORTFOLIO", label: "Портфолио" },
            { value: "BLOG_NEWS", label: "Блог / Новости" },
            { value: "PROMOTIONAL_MICROSITE", label: "Промо-сайт" }
        ]
    },
    {
        label: "Бизнес",
        options: [
            { value: "CORPORATE_BUSINESS", label: "Корпоративный сайт" },
            { value: "NON_PROFIT_CHARITY", label: "Некоммерческий проект" },
            { value: "EDUCATIONAL_LMS", label: "Образовательная платформа" }
        ]
    },
    {
        label: "E-Commerce",
        options: [
            { value: "E_COMMERCE_STORE", label: "Интернет-магазин" },
            { value: "MARKETPLACE", label: "Маркетплейс" },
            { value: "BOOKING_RESERVATION", label: "Система бронирования" }
        ]
    },
    {
        label: "Веб-сервисы",
        options: [
            { value: "SPA", label: "SPA Приложение" },
            { value: "PWA", label: "PWA Приложение" },
            { value: "SAAS_DASHBOARD", label: "SaaS Dashboard" },
            { value: "CRM_ERP_SYSTEM", label: "CRM / ERP Система" },
            { value: "SOCIAL_NETWORK", label: "Социальная сеть" },
            { value: "FORUM_COMMUNITY", label: "Форум" }
        ]
    },
    {
        label: "Специфичные",
        options: [
            { value: "RE_ESTATE_LISTING", label: "Недвижимость" },
            { value: "PORTAL_INTRANET", label: "Внутренний портал" },
            { value: "WIKI_KNOWLEDGE_BASE", label: "База знаний" },
            { value: "CUSTOM_DEVELOPMENT", label: "Кастомная разработка" },
            { value: "OTHER", label: "Другое" }
        ]
    }
];

export function CommissionFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Стейты для кастомного дропдауна
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [catSearch, setCatSearch] = useState("");

    const currentTypeVal = searchParams.get("commissionType") || "ALL";

    // Находим человекочитаемое название выбранной категории
    const currentTypeLabel = useMemo(() => {
        if (currentTypeVal === "ALL") return "Все категории";
        for (const group of CATEGORY_GROUPS) {
            const found = group.options.find(opt => opt.value === currentTypeVal);
            if (found) return found.label;
        }
        return "Все категории";
    }, [currentTypeVal]);

    const handleSearchChange = (value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set("keywords", value);
        else newParams.delete("keywords");
        newParams.delete("page");
        setSearchParams(newParams);
    };

    const handleCategorySelect = (value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value !== "ALL") newParams.set("commissionType", value);
        else newParams.delete("commissionType");
        newParams.delete("page");
        setSearchParams(newParams);
        setIsDropdownOpen(false);
        setCatSearch(""); // Сбрасываем поиск при закрытии
    };

    // Фильтруем категории по локальному инпуту
    const filteredGroups = useMemo(() => {
        if (!catSearch) return CATEGORY_GROUPS;
        const lowerSearch = catSearch.toLowerCase();

        return CATEGORY_GROUPS.map(group => ({
            ...group,
            options: group.options.filter(opt => opt.label.toLowerCase().includes(lowerSearch))
        })).filter(group => group.options.length > 0);
    }, [catSearch]);

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
            {/* Поиск по названию */}
            <div className="w-full sm:flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Поиск по названию заказа..."
                    defaultValue={searchParams.get("keywords") || ""}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full text-xs py-2.5 pl-9 pr-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all bg-slate-50"
                />
            </div>

            {/* Умный дропдаун категорий */}
            <div className="w-full sm:w-64 relative">
                <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full text-left text-xs py-2.5 pl-9 pr-8 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-all bg-slate-50 font-medium text-slate-700 flex justify-between items-center"
                >
                    <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <span className="truncate">{currentTypeLabel}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </button>

                {isDropdownOpen && (
                    <>
                        {/* Невидимый фон для закрытия по клику вне меню */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />

                        <div className="absolute right-0 top-full mt-2 w-full sm:w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-80">
                            <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Найти категорию..."
                                    value={catSearch}
                                    onChange={(e) => setCatSearch(e.target.value)}
                                    className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                                />
                            </div>

                            <div className="overflow-y-auto p-2">
                                <button
                                    onClick={() => handleCategorySelect("ALL")}
                                    className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${currentTypeVal === "ALL" ? "bg-slate-900 text-white font-bold" : "hover:bg-slate-100 text-slate-700"}`}
                                >
                                    Все категории
                                </button>

                                {filteredGroups.length === 0 ? (
                                    <div className="p-3 text-center text-xs text-slate-400">Ничего не найдено</div>
                                ) : (
                                    filteredGroups.map(group => (
                                        <div key={group.label} className="mt-2">
                                            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {group.label}
                                            </div>
                                            {group.options.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => handleCategorySelect(opt.value)}
                                                    className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${currentTypeVal === opt.value ? "bg-slate-900 text-white font-bold" : "hover:bg-slate-100 text-slate-700"}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}