import { useState, useRef, useEffect } from "react";
import { HiChevronDown,  HiCheck } from "react-icons/hi2";
import { HiOutlineSearch } from "react-icons/hi";

interface Option {
    label: string;
    value: string;
}

interface Props {
    options: Option[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

export function MultiFilterDropdown({ options, selectedValues, onChange, placeholder = "Фильтр..." }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

    const toggleOption = (val: string) => {
        if (selectedValues.includes(val)) {
            onChange(selectedValues.filter(v => v !== val));
        } else {
            onChange([...selectedValues, val]);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 flex items-center justify-between gap-3 bg-[#0d1930]/50 border border-blue-500/20 px-4 rounded-xl text-sm text-slate-300 hover:text-white focus:border-blue-500 transition-colors shadow-inner min-w-[200px]"
            >
                <span className="truncate">
                    {selectedValues.length > 0 ? `Выбрано: ${selectedValues.length}` : placeholder}
                </span>
                <HiChevronDown className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-64 bg-[#0a1428] border border-blue-500/20 rounded-xl shadow-2xl overflow-hidden right-0">
                    <div className="p-2 border-b border-white/5 bg-black/20">
                        <div className="flex items-center gap-2 bg-[#0d1930]/50 rounded-lg px-3 py-1.5 border border-white/5">
                            <HiOutlineSearch className="text-slate-500 shrink-0" size={14} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Поиск..."
                                className="w-full bg-transparent border-none text-xs text-white focus:outline-none placeholder:text-slate-600"
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filtered.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-500">Нет вариантов</div>
                        ) : (
                            filtered.map((opt) => {
                                const isSelected = selectedValues.includes(opt.value);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => toggleOption(opt.value)}
                                        className="w-full flex items-center gap-2 text-left p-2.5 hover:bg-blue-500/10 rounded-lg transition-colors group"
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500 text-[#020817]' : 'border-slate-600'}`}>
                                            {isSelected && <HiCheck size={12} strokeWidth={2} />}
                                        </div>
                                        <span className={`text-sm ${isSelected ? 'text-white font-bold' : 'text-slate-300'}`}>
                                            {opt.label}
                                        </span>
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