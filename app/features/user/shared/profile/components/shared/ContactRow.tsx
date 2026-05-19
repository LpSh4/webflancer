import React from "react";

export function ContactRow({icon, label, value}: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 last:pb-0">
            <div className="text-slate-400 bg-slate-800/50 p-2.5 rounded-xl shadow-inner border border-white/5">
                {icon}
            </div>
            <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
                <div className="text-sm font-bold text-white mt-0.5">{value}</div>
            </div>
        </div>
    );
}