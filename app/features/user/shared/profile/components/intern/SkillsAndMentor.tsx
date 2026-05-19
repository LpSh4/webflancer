import type {Skill, ProfileMentor} from "../../model";
import {UserAvatar} from "app/shared/ui/UserAvatar";
import {Link} from "react-router";
import {IoPaperPlaneOutline} from "react-icons/io5";
import {Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer} from "recharts";

export function SkillsCard({skills}: { skills: Skill[] }) {
    return (
        <div className="glass-panel p-6 md:p-8 rounded-3xl md:rounded-4xl border border-white/5 flex flex-col h-full">
            <h3 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
                Матрица навыков
            </h3>

            {skills.length === 0 ? (
                <div
                    className="flex-1 flex items-center justify-center text-xs text-slate-500 italic text-center min-h-37.5">
                    Навыки пока не добавлены
                </div>
            ) : (
                <div className="flex flex-col flex-1">
                    {/*  Радарная диаграмма скиллов (рендерится только если навыков >= 3, иначе выглядит криво) */}
                    {skills.length >= 3 && (
                        <div className="h-50 w-full mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skills}>
                                    <PolarGrid stroke="rgba(255,255,255,0.05)"/>
                                    <PolarAngleAxis
                                        dataKey="label"
                                        tick={{fill: '#64748b', fontSize: 9, fontWeight: 800}}
                                    />
                                    <Radar
                                        name="Уровень"
                                        dataKey="percent"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.2}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                        {skills.map((skill) => (
                            <span
                                key={skill.id}
                                className="px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold border transition-colors hover:brightness-125 cursor-default"
                                style={{
                                    backgroundColor: `${skill.barColor}15`,
                                    color: skill.barColor,
                                    borderColor: `${skill.barColor}30`
                                }}
                            >
                                {skill.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export function MentorCard({mentor}: { mentor: ProfileMentor }) {
    return (
        <div
            className="glass-panel p-6 md:p-8 rounded-3xl md:rounded-4xl border border-blue-500/20 bg-linear-to-b from-blue-900/10 to-transparent group relative overflow-hidden flex flex-col shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] pointer-events-none"/>

            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 relative z-10">
                Твой наставник
            </span>

            <Link
                to={`/users/${mentor.id}`}
                className="flex items-center gap-3 sm:gap-4 mt-6 mb-8 relative z-10 cursor-pointer group/mentor"
            >
                <UserAvatar src={mentor.avatar} name={mentor.name} size={44} lastOnline={mentor.lastOnline}
                            showStatus={true} className="shrink-0 transition-transform group-hover/mentor:scale-105"/>
                <div className="min-w-0">
                    <div
                        className="font-bold text-base sm:text-lg text-white leading-tight truncate group-hover/mentor:text-blue-400 transition-colors">
                        {mentor.name}
                    </div>
                    <div
                        className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 truncate">
                        {mentor.position}
                    </div>
                </div>
            </Link>

            <Link
                to={`/chat?userId=${mentor.id}`}
                className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-xl text-xs font-bold transition-all relative z-10 flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-blue-500/20 hover:border-blue-500/50"
            >
                <IoPaperPlaneOutline size={16}/>
                Задать вопрос
            </Link>
        </div>
    );
}