import {PieChart, Pie, ResponsiveContainer, Tooltip as RechartsTooltip} from 'recharts';

export function AdaptationCard({percent, tasksCompleted, tasksRemaining}: {
    percent: number;
    tasksCompleted: number;
    tasksRemaining: number;
}) {
    const data = [
        {name: 'Выполнено', value: tasksCompleted, fill: '#3b82f6'},
        {name: 'Осталось', value: tasksRemaining, fill: '#1e293b'}
    ];

    return (
        <div className="glass-panel p-5 sm:p-8 rounded-3xl md:rounded-[2rem] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-10 min-w-0 overflow-hidden">
            <div className="flex-1 text-center sm:text-left min-w-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate block">Уровень адаптации</span>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tighter mt-2 mb-2 sm:mb-3">{percent}%</div>
                <p className="text-[10px] sm:text-xs text-blue-400 font-medium leading-snug">Осталось {tasksRemaining} задач до закрытия онбординга</p>
            </div>

            <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 relative drop-shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                {tasksCompleted === 0 && tasksRemaining === 0 ? (
                    <div className="absolute inset-0 rounded-full border-[8px] sm:border-[10px] border-slate-800/50"/>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius="70%"
                                outerRadius="100%"
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            />
                            <RechartsTooltip
                                contentStyle={{
                                    backgroundColor: '#020817',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                }}
                                itemStyle={{color: '#fff'}}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export function ChecklistCard({completed, total}: { completed: number; total: number; }) {
    return (
        <div className="glass-panel p-5 sm:p-8 rounded-3xl md:rounded-[2rem] border border-white/5 flex flex-col justify-center items-center text-center group transition-colors hover:border-emerald-500/20 h-full min-h-[180px] min-w-0 overflow-hidden">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
            </div>
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter truncate max-w-full">
                {completed} <span className="text-slate-600 text-xl sm:text-2xl">/ {total}</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 truncate max-w-full">Задач выполнено</span>
        </div>
    );
}