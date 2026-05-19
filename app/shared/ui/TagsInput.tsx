import {useState, type KeyboardEvent} from "react";
import {HiOutlineXMark} from "react-icons/hi2";
import {getSkillHexColor} from "./SearchableDropdown";

interface Props {
    name: string;
    initialTags?: string[];
    placeholder?: string;
}

export function TagsInput({name, initialTags = [], placeholder = "Введите навык и нажмите Enter..."}: Props) {
    const [tags, setTags] = useState<string[]>(initialTags);
    const [input, setInput] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const val = input.trim();
            if (val && !tags.includes(val)) {
                setTags([...tags, val]);
            }
            setInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const payload = tags.map(t => ({
        name: t,
        color: getSkillHexColor(t) // Привязываем цвет перед отправкой
    }));

    return (
        <div>
            <input type="hidden" name={name} value={JSON.stringify(payload)}/>

            <div
                className="min-h-[46px] w-full bg-[#0d1930]/50 border border-blue-500/10 px-3 py-2 rounded-xl flex flex-wrap gap-2 focus-within:border-blue-500 transition-colors">
                {tags.map(tag => {
                    const hex = getSkillHexColor(tag);
                    return (
                        <span
                            key={tag}
                            style={{color: hex, backgroundColor: `${hex}15`, borderColor: `${hex}30`}}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border"
                        >
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)}
                                    className="hover:text-white rounded-full p-0.5">
                                <HiOutlineXMark size={12}/>
                            </button>
                        </span>
                    );
                })}

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none min-w-[120px]"
                />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 ml-1">Разделяйте навыки клавишей Enter.</p>
        </div>
    );
}