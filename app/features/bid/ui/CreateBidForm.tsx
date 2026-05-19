interface CreateBidFormProps {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function CreateBidForm({ onSubmit }: CreateBidFormProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm sticky top-20">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Предложить свои услуги
            </h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Ценник ($)</label>
                        <input type="number" name="price" required defaultValue={200} className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50 font-medium" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Срок (дни)</label>
                        <input type="number" name="days" required defaultValue={3} className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50 font-medium" />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Сопроводительное письмо</label>
                    <textarea name="comment" rows={5} required placeholder="Привет! Готов взяться за проект. Опыт в подобном стеке более 2 лет, примеры работ в профиле..." className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50 resize-none leading-relaxed" />
                </div>
                <button type="submit" className="w-full text-xs bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                    Отправить отклик
                </button>
            </form>
        </div>
    );
}