import {useSubmit} from "react-router";
import {IoLogOutOutline} from "react-icons/io5";

export function LogoutButton() {
    const submit = useSubmit();

    const handleLogout = () => {
        if (confirm("Вы уверены, что хотите выйти?")) {
            // Отправляем пустой POST запрос на текущую страницу
            submit(null, {method: "post"});
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full mt-4 py-3 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
        >
            <IoLogOutOutline size={18}/>
            Выйти из системы
        </button>
    );
}