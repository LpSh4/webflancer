import type {ActivityDay} from "../../model";
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts';

interface ActivityChartProps {
    data: ActivityDay[];
}

export function ActivityChart({data}: ActivityChartProps) {

    const CustomTooltip = ({active, payload}: any) => {
        if (active && payload && payload.length) {
            const count = payload[0].value;
            let word = 'задач';
            if (count % 10 === 1 && count % 100 !== 11) word = 'задача';
            else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) word = 'задачи';

            return (
                <div className="bg-[#020817] border border-white/10 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-xl flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm bg-blue-500"/>
                    <span>{count} {word}</span>
                </div>
            );
        }
        return null;
    };

    const renderBarShape = (props: any) => {
        const {x, y, width, height, payload} = props;
        if (x == null || y == null || width == null) return null;

        let fill = '#1e293b';
        if (payload.isActive) fill = '#3b82f6';
        else if (payload.isFuture) fill = '#0f172a';

        const safeHeight = Math.max(Number(height) || 0, 4);
        const safeY = (Number(height) || 0) === 0 ? Number(y) - 4 : Number(y);

        return (
            <rect x={x} y={safeY} width={width} height={safeHeight} fill={fill} rx={4} ry={4}
                  className="transition-all duration-300 hover:brightness-125"/>
        );
    };

    const maxTasks = Math.max(...data.map(d => d.tasksCount));
    const yDomain: [number, number | 'auto'] = maxTasks === 0 ? [0, 4] : [0, 'auto'];

    return (
        <div className="glass-panel rounded-3xl md:rounded-4xl p-5 sm:p-8 border border-white/5 relative overflow-hidden flex flex-col justify-between h-full min-h-[220px] sm:min-h-[260px] min-w-0">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none"/>

            <div className="flex justify-between items-center mb-4 sm:mb-8 relative z-10 shrink-0">
                <h3 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest truncate">
                    Динамика обучения
                </h3>
            </div>

            <div className="flex-1 w-full relative z-10 min-h-30">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{top: 10, right: 0, left: 0, bottom: -5}}>
                        <YAxis hide domain={yDomain}/>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={({x, y, payload}: any) => (
                                <text x={x} y={Number(y) + 12} textAnchor="middle" fill="#64748b" fontSize="9"
                                      fontWeight="800" className="uppercase tracking-widest">
                                    {payload.value}
                                </text>
                            )}
                        />
                        <Tooltip content={<CustomTooltip/>} cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}/>
                        <Bar dataKey="tasksCount" maxBarSize={30} shape={renderBarShape}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}