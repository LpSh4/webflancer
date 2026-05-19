import type { ProfileData, ActivityDay, Skill } from "./model";

// ─── Dummy data ───────────────────────────────────────────────────────────────

const ACTIVITY: ActivityDay[] = [
    { day: "Пн", heightPercent: 40, isActive: false, isFuture: false },
    { day: "Вт", heightPercent: 60, isActive: false, isFuture: false },
    { day: "Ср", heightPercent: 90, isActive: true,  isFuture: false },
    { day: "Чт", heightPercent: 30, isActive: false, isFuture: false },
    { day: "Пт", heightPercent: 75, isActive: false, isFuture: false },
    { day: "Сб", heightPercent: 10, isActive: false, isFuture: true  },
    { day: "Вс", heightPercent: 10, isActive: false, isFuture: true  },
];

const SKILLS: Skill[] = [
    {
        id: "react",
        label: "React / Next.js",
        percent: 85,
        color: "text-blue-400",
        barColor: "bg-blue-500",
        shadow: "0 0 10px rgba(59,130,246,0.5)",
    },
    {
        id: "node",
        label: "Fastify / Node",
        percent: 40,
        color: "text-purple-400",
        barColor: "bg-purple-500",
        shadow: "0 0 10px rgba(168,85,247,0.5)",
    },
    {
        id: "tailwind",
        label: "Tailwind CSS",
        percent: 95,
        color: "text-emerald-400",
        barColor: "bg-emerald-500",
        shadow: "0 0 10px rgba(16,185,129,0.5)",
    },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export function getProfileData(): ProfileData {
    return {
        fullName: "Алексей Алексеев",
        position: "Frontend Developer",
        joinedAt: "15 февраля",
        avatar:
            "https://ui-avatars.com/api/?name=Alex&background=1e293b&color=3b82f6&size=128",
        isOnline: true,

        adaptationPercent: 72,
        tasksCompleted: 26,
        tasksTotal: 34,
        tasksRemaining: 8,

        activity: ACTIVITY,
        skills: SKILLS,

        mentor: {
            name: "Олег Олегов",
            position: "Senior Fullstack",
            avatar:
                "https://ui-avatars.com/api/?name=Oleg&background=3b82f6&color=fff&rounded=true",
        },
    };
}