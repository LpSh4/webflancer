import { useLoaderData } from "react-router";
import type { Route } from "./+types/view";

// Типы данных такие же, как у тебя в модели User
export async function loader({ params }: Route.LoaderArgs) {
    // В реальности здесь будет вызов: await userService.findById(params.id)
    return {
        user: {
            id: params.id,
            displayedName: "Алексей Разработчик",
            role: "DEVELOPER",
            averageRating: 4.95,
            bio: "Разрабатываю на React/Fastify. Опыт 5 лет.",
            skills: ["Python", "TypeScript", "React", "SQLAlchemy"],
            portfolioLinks: ["https://github.com/alexdev"]
        }
    };
}

export default function PublicProfilePage() {
    const { user } = useLoaderData<typeof loader>();

    return (
        <div className="flex-1 bg-slate-50 min-h-screen py-10">
            <div className="max-w-3xl mx-auto px-6">
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                    {/* Хедер профиля */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500">
                            {user.displayedName}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{user.displayedName}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                    {user.role}
                                </span>
                                <span className="text-amber-500 font-bold text-sm">★ {user.averageRating}</span>
                            </div>
                        </div>
                    </div>

                    {/* Информация */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase mb-2">О себе</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{user.bio}</p>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase mb-2">Стек технологий</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.skills.map(skill => (
                                    <span key={skill} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase mb-2">Портфолио</h3>
                            {user.portfolioLinks.map(link => (
                                <a key={link} href={link} target="_blank" className="text-xs text-blue-600 hover:underline block">
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}