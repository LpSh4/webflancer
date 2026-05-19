interface CommissionFiltersProps {
    onTypeChange: (type: string) => void;
    onSearchChange: (query: string) => void;
}

export function CommissionFilters({ onTypeChange, onSearchChange }: CommissionFiltersProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
            <div className="w-full sm:flex-1">
                <input
                    type="text"
                    placeholder="Поиск по названию заказа..."
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50"
                />
            </div>
            <div className="w-full sm:w-48">
                <select
                    onChange={(e) => onTypeChange(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50 font-medium text-slate-700"
                >
                    <option value="ALL">Все категории</option>
                    <option value="LANDING_PAGE">Landing Page</option>
                    <option value="TELEGRAM_BOT">Telegram Bot</option>
                    <option value="WEB_APPLICATION">Web Application</option>
                </select>
            </div>
        </div>
    );
}