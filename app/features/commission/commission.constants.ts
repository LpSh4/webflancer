// /features/commission/commission.constants.ts

export const COMMISSION_PROGRESS_LABELS: Record<string, string> = {
    POSTED: "Ищет исполнителя",
    ARCHIVED: "В архиве",
    CONTRACT_STARTED: "Контракт запущен",
    DEVELOPMENT: "В разработке",
    TESTING: "Тестирование",
    DEV_COMPLETE: "Проект сдан (ожидает апрува)",
    COMPLETED: "Завершен",
    CANCELLED: "Отменен",
    DISPUTED: "Арбитраж / Спор",
    REFUNDED: "Возврат средств",
};

// Бонус: если в будущем где-то понадобится выводить детальный WorkStatus, словарь для него:
export const COMMISSION_WORK_STATUS_LABELS: Record<string, string> = {
    PENDING: "Ожидание старта",
    REQUIREMENTS: "Сбор требований",
    UI_UX_DESIGN: "Проектирование и дизайн",
    DB_DESIGN: "Архитектура БД",
    BACKEND_DEV: "Разработка бэкенда",
    FRONTEND_DEV: "Разработка фронтенда",
    DEVOPS_EST: "Настройка окружения / DevOps",
    INTEGRATION: "Интеграция систем",
    PRODUCTION: "В продакшене",
};

// /features/commission/commission.constants.ts

export const BID_STATUS_LABELS: Record<string, string> = {
    created: "Ожидает ответа",
    accepted: "Одобрен",
    rejected: "Отклонен",
    withdrawn: "Отозван",
};

// Хелпер для стилей откликов
export const getBidStatusStyles = (status: string) => {
    switch (status) {
        case "created":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "accepted":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "rejected":
            return "bg-red-50 text-red-700 border-red-200";
        case "withdrawn":
            return "bg-slate-100 text-slate-600 border-slate-200";
        default:
            return "bg-slate-50 text-slate-500 border-slate-200";
    }
};