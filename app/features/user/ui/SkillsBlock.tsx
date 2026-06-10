interface SkillsBlockProps {
    skills: string[];
    onAddSkill: (e: React.FormEvent<HTMLFormElement>) => void;
    onRemoveSkill: (skill: string) => void;
}

export function SkillsBlock({ skills, onAddSkill, onRemoveSkill }: SkillsBlockProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Мой технологический стек
            </h3>

            {/* Список тегов */}
            <div className="flex flex-wrap gap-1.5">
                {skills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Стек пока пуст. Добавьте первый навык ниже.</p>
                ) : (
                    skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium group">
                            {skill}
                            <button type="button" onClick={() => onRemoveSkill(skill)} className="text-slate-400 hover:text-red-500 transition-colors font-bold text-[10px]">
                                ✕
                            </button>
                        </span>
                    ))
                )}
            </div>

            {/* Форма добавления */}
            <form onSubmit={onAddSkill} className="flex gap-2 pt-2 border-t border-slate-100">
                <input type="text" name="skillName" required placeholder="Например: Fastify, Docker, Next.js" className="flex-1 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50" />
                <button type="submit" className="text-xs bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                    +
                </button>
            </form>
        </div>
    );
}