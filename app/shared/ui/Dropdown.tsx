import {useState, useRef, useEffect} from "react";
import {HiChevronDown} from "react-icons/hi2";

export interface DropdownOption {
    value: string;
    label: string;
    description?: string;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function Dropdown({
                             options,
                             value,
                             onChange,
                             placeholder = "Выберите...",
                             className = "",
                             size = "md"
                         }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    const buttonSizes = {
        sm: "h-7 md:h-8 px-2 md:px-3 text-[10px] md:text-xs",
        md: "h-9 md:h-10 px-3 md:px-4 text-xs md:text-sm",
        lg: "h-11 md:h-[52px] px-4 md:px-5 text-sm md:text-base"
    };

    const itemSizes = {
        sm: "py-1.5 md:py-2 px-2 md:px-3",
        md: "py-2 md:py-2.5 px-3 md:px-4",
        lg: "py-2.5 md:py-3 px-4 md:px-5"
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-[#0d1930]/60 border border-blue-500/20 rounded-lg md:rounded-xl text-white hover:border-blue-500/50 focus:border-blue-500 focus:outline-none transition-all shadow-lg text-left ${buttonSizes[size]}`}
            >
                <span className={`truncate ${selectedOption ? "text-blue-50" : "text-blue-400/40"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <HiChevronDown
                    className={`shrink-0 text-blue-400/50 transition-transform duration-300 ml-2 ${isOpen ? "rotate-180 text-blue-400" : ""}`}/>
            </button>

            {isOpen && (
                <div
                    className="absolute z-50 w-full mt-1.5 md:mt-2 bg-[#0a1428]/95 backdrop-blur-md border border-blue-500/30 rounded-lg md:rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden max-h-52 md:max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-xs md:text-sm text-blue-400/30 italic text-center">Нет
                            вариантов</div>
                    ) : (
                        <ul className="py-1">
                            {options.map((option) => (
                                <li key={option.value}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left hover:bg-blue-600/20 hover:text-white transition-all flex flex-col group ${itemSizes[size]}`}
                                    >
                                        <span
                                            className={`font-medium ${size === 'sm' ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm'} ${option.value === value ? "text-blue-400" : "text-slate-300 group-hover:text-blue-100"}`}>
                                            {option.label}
                                        </span>
                                        {option.description && (
                                            <span
                                                className={`text-blue-400/40 mt-0.5 group-hover:text-blue-400/60 ${size === 'sm' ? 'text-[8px] md:text-[9px]' : 'text-[9px] md:text-[10px]'}`}>
                                                {option.description}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}