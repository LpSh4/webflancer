export interface Skill {
    id: string;
    label: string;
    percent: number;
    barColor: string;   // Теперь это просто HEX (например #3b82f6)
}

export interface ActivityDay {
    day: string;
    tasksCount: number;
    isActive: boolean;
    isFuture: boolean;
}

export interface ProfileMentor {
    id: string;
    name: string;
    position: string;
    avatar: string;
    lastOnline: Date;
}

export interface ProfileData {
    id: string;
    displayName?: string;
    login: string;
    email?: string;
    teamSize?: number;
    position: {
        id: string;
        name: string;
        color: string;
    },
    joinedAt: string;
    avatar: string;
    role: string;
    lastOnline: Date;
    adaptationPercent: number;
    tasksCompleted: number;
    tasksTotal: number;
    tasksRemaining: number;
    activity: ActivityDay[];
    skills: Skill[];
    mentor: ProfileMentor | null; // Разрешаем null
}