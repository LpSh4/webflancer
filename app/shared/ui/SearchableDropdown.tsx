import {useState, useRef, useEffect} from "react";
import {HiChevronDown} from "react-icons/hi2";
import {HiOutlineSearch} from "react-icons/hi";
import type {Stage} from "~/features/stage-teamlead/model";

interface Props {
    stages: Stage[];
    onSelect: (stageId: string) => void;
    placeholder?: string;
}

export function getSkillHexColor(name: string) {
    if (!name) return '#3b82f6';
    const colors = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#f43f5e', '#06b6d4'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

export function SearchableDropdown({stages, onSelect, placeholder = "Выберите..."}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // При открытии фокусируемся на поиске
    useEffect(() => {
        if (isOpen && inputRef.current) inputRef.current.focus();
        if (!isOpen) setSearch(""); // очищаем поиск при закрытии
    }, [isOpen]);

    const filtered = stages.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.skills?.some(skill => skill.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-[#0d1930]/50 border border-blue-500/20 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white focus:border-blue-500 transition-colors shadow-inner text-left"
            >
                <span>{placeholder}</span>
                <HiChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`}/>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#0a1428] border border-blue-500/20 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-white/5 flex items-center gap-2 bg-black/20">
                        <HiOutlineSearch className="text-slate-500 shrink-0" size={16} />
                        <input ref={inputRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию или навыку..." className="w-full bg-transparent border-none text-sm text-white focus:outline-none placeholder:text-slate-600" />
                    </div>

                    <div className="max-h-72 overflow-y-auto p-1">
                        {filtered.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">Ничего не найдено</div>
                        ) : (
                            filtered.map((stage) => {
                                const desc = stage.description || "";
                                const truncatedDesc = desc.length > 100 ? desc.substring(0, 100) + "..." : desc;

                                return (
                                    <button key={stage.id} type="button" onClick={() => { onSelect(stage.id); setIsOpen(false); }} className="w-full text-left p-3 hover:bg-blue-500/10 rounded-lg transition-colors flex flex-col gap-1.5 group">
                                        <div className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{stage.title}</div>
                                        {truncatedDesc && <p className="text-[11px] text-slate-500 leading-tight">{truncatedDesc}</p>}

                                        {stage.skills && stage.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {stage.skills.map(skill => {
                                                    // Берем цвет из базы, либо генерируем на лету
                                                    const hex = skill.color || getSkillHexColor(skill.name);
                                                    return (
                                                        <span
                                                            key={skill.name}
                                                            style={{ color: hex, backgroundColor: `${hex}15`, borderColor: `${hex}30` }}
                                                            className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border"
                                                        >
                                                            {skill.name}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}