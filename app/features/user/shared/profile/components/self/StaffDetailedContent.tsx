import type {ProfileData} from "app/features/user/shared/profile/model";
import {
    IoAnalyticsOutline,
    IoBriefcaseOutline,
    IoMailOutline,
    IoPeopleOutline,
    IoSettingsOutline
} from "react-icons/io5";
import {Link} from "react-router";
import {LogoutButton} from "app/features/user/shared/profile/components/LogoutButton";
import {ContactRow} from "app/features/user/shared/profile/components/shared/ContactRow";
import {roleMap} from "app/shared/utils/ru_labels";

export function StaffDetailedContent({profile}: { profile: ProfileData }) {
    const isTeamlead = profile.role === 'teamlead';

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Блок контактов */}
                <div className="col-span-1 lg:col-span-2 glass-panel p-6 sm:p-8 rounded-4xl border border-white/5">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Рабочий профиль</h2>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ваша контактная информация</span>
                        </div>
                        <span
                            className={`self-start px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isTeamlead ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            {roleMap[profile.role] || profile.role}
                        </span>
                    </div>

                    <div className="space-y-2 bg-black/20 rounded-2xl p-4 sm:p-6 border border-white/5">
                        <ContactRow icon={<IoMailOutline/>} label="Корпоративный Email"
                                    value={profile.email || "Не указан"}/>
                        <ContactRow icon={<IoBriefcaseOutline/>} label="Должность" value={profile.position?.name}/>
                    </div>
                </div>

                {/* actions*/}
                <div
                    className="col-span-1 glass-panel p-6 sm:p-8 rounded-4xl border border-white/5 flex flex-col justify-between relative overflow-hidden min-h-62.5">
                    <div
                        className={`absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] rounded-full pointer-events-none ${isTeamlead ? 'bg-blue-600/20' : 'bg-purple-600/20'}`}/>

                    <div className="relative z-10 mb-8 lg:mb-0">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">
                            {isTeamlead ? 'Моя команда' : 'Управление'}
                        </span>

                        {isTeamlead ? (
                            <div className="flex items-end gap-3 mb-6">
                                <div
                                    className="text-5xl sm:text-6xl font-black text-white leading-none">{profile.teamSize || 0}</div>
                                <div className="text-xs sm:text-sm font-bold text-slate-400 pb-1">стажеров</div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center">
                                    <IoPeopleOutline size={24}/>
                                </div>
                                <div className="text-sm font-bold text-slate-300">Вся база<br/>сотрудников</div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 relative z-10">
                        <Link
                            to={isTeamlead ? "/teamlead-panel?tab=assignments" : "/team"}
                            className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all border ${
                                isTeamlead ? 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border-blue-500/20' : 'bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border-purple-500/20'
                            }`}
                        >
                            {isTeamlead ? <IoAnalyticsOutline size={16}/> : <IoSettingsOutline size={16}/>}
                            {isTeamlead ? 'Мои стажеры' : 'Все сотрудники'}
                        </Link>
                        <LogoutButton/>
                    </div>
                </div>
            </div>
        </div>
    );
}