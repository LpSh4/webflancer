import type {ProfileData} from "~/features/user/profile/model";
import {
    IoBriefcaseOutline,
    IoChatbubblesOutline,
    IoMailOutline,
    IoPeopleOutline,
    IoCheckmarkCircleOutline
} from "react-icons/io5";
import {ContactRow} from "~/features/user/profile/components/shared/ContactRow";
import {Link} from "react-router";

export function StaffPublicContent({profile}: { profile: ProfileData }) {
    const isTeamlead = profile.role === 'teamlead';

    const responsibilities = isTeamlead ? [
        "Назначение программ адаптации стажерам",
        "Проверка выполненных задач и обратная связь",
        "Отслеживание прогресса своей команды",
        "Принятие решения об успешном прохождении ИС"
    ] : [
        "Управление общей базой сотрудников компании",
        "Глобальная аналитика процесса онбординга",
        "Управление библиотекой этапов и программ"
    ];

    const accentColor = isTeamlead ? "text-blue-400" : "text-purple-400";
    const bgAccent = isTeamlead ? "bg-blue-500/10 border-blue-500/20" : "bg-purple-500/10 border-purple-500/20";
    const iconBg = isTeamlead ? 'bg-blue-500 text-white shadow-blue-500/20' : 'bg-purple-500 text-white shadow-purple-500/20';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* contacts*/}
            <div className="col-span-1 lg:col-span-2 space-y-6">
                <div className="glass-panel p-6 sm:p-8 rounded-4xl border border-white/5">

                    <div className="flex items-center gap-4 mb-8">
                        <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${iconBg}`}>
                            {isTeamlead ? <IoPeopleOutline size={28}/> : <IoBriefcaseOutline size={28}/>}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">
                                {isTeamlead ? 'Наставник' : 'Специалист отдела кадров'}
                            </h2>
                            <div className="text-xs font-medium text-slate-400 mt-1 max-w-md">
                                {isTeamlead
                                    ? 'Отвечает за техническое развитие и процессы в команде.'
                                    : 'Поможет с документами, отпусками и общими вопросами адаптации.'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-2">
                        <ContactRow icon={<IoMailOutline/>} label="Рабочая почта" value={profile.email || "Скрыт"}/>
                        <ContactRow icon={<IoBriefcaseOutline/>} label="Текущая должность"
                                    value={profile.position?.name}/>
                    </div>

                    <Link
                        to={`/chat?userId=${profile.id}`}
                        className={`mt-6 w-full py-4 flex items-center justify-center gap-2 rounded-2xl text-xs font-bold transition-all border hover:brightness-125 ${bgAccent} ${accentColor} cursor-pointer active:scale-95`}
                    >
                        <IoChatbubblesOutline size={18}/>
                        Написать сообщение
                    </Link>
                </div>
            </div>

            {/* info */}
            <div className="col-span-1">
                <div className="glass-panel p-6 sm:p-8 rounded-4xl border border-white/5 h-full">
                    <h3 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
                        Зоны ответственности
                    </h3>
                    <ul className="space-y-4">
                        {responsibilities.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <IoCheckmarkCircleOutline className={`mt-0.5 shrink-0 ${accentColor}`} size={18}/>
                                <span className="text-sm text-slate-300 leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
}