import { useLoaderData } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/profile";
import type { UserProfile } from "~/features/user/shared/model";
import { ProfileInfoCard } from "~/features/user/ui/ProfileInfoCard";
import { SkillsBlock } from "~/features/user/ui/SkillsBlock";

export async function loader({ request }: Route.LoaderArgs) {
    const user: UserProfile = {
        id: "user-777",
        role: "DEVELOPER",
        login: "alex_developer",
        email: "alex.dev@webflancer.ru",
        phoneNumber: "+79991112233",
        verifiedEmail: true,
        displayedName: "Алексей Разработчик",
        name: "Алексей",
        surname: "Иванов",
        profileStatus: "Пишу код на коленке",
        averageRating: 4.95,
        lastOnline: new Date()
    };

    const initialSkills = ["Python", "TypeScript", "React", "SQLAlchemy"];

    return { user, initialSkills };
}

export default function ProfilePage() {
    const { user: initialUser, initialSkills } = useLoaderData() as { user: UserProfile; initialSkills: string[] };

    const [user, setUser] = useState<UserProfile>(initialUser);
    const [skills, setSkills] = useState<string[]>(initialSkills);

    const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setUser({
            ...user,
            displayedName: formData.get("displayedName") as string
        });
        alert("Профиль успешно обновлен (Локальный сейв!)");
    };

    const toggleRole = () => {
        setUser({
            ...user,
            role: user.role === "DEVELOPER" ? "CLIENT" : "DEVELOPER"
        });
    };

    const handleAddSkill = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newSkill = (formData.get("skillName") as string).trim();

        if (newSkill && !skills.includes(newSkill)) {
            setSkills([...skills, newSkill]);
        }
        e.currentTarget.reset();
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    return (
        <div className="flex-1 bg-slate-50 min-h-screen py-10">
            <div className="max-w-6xl mx-auto px-6">
                <div className="border-b border-slate-200 pb-5 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Настройки профиля</h1>
                        <p className="text-xs text-slate-500 mt-1">Управление личными данными и конфигурацией аккаунта</p>
                    </div>
                    <button type="button" onClick={toggleRole} className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-sm">
                        Сменить режим: {user.role === "DEVELOPER" ? "Заказчик" : "Разработчик"}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div>
                        <ProfileInfoCard user={user} />
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 mb-4">
                                Личная информация
                            </h3>
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Отображаемое имя / Никнейм</label>
                                    <input type="text" name="displayedName" required defaultValue={user.displayedName} className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50 font-medium text-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Контактный Email (Не изменяется локально)</label>
                                    <input type="email" disabled value={user.email} className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed font-medium" />
                                </div>
                                <button type="submit" className="text-xs bg-slate-900 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                                    Сохранить изменения
                                </button>
                            </form>
                        </div>

                        {user.role === "DEVELOPER" && (
                            <SkillsBlock skills={skills} onAddSkill={handleAddSkill} onRemoveSkill={handleRemoveSkill} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}