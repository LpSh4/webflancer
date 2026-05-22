import { Outlet, useLoaderData } from "react-router";
import { getUser } from "~/shared/utils/auth.server";
import { Navbar } from "~/shared/ui/Navbar";
import type { Route } from "./+types/app-layout";

export async function loader({ request }: Route.LoaderArgs) {
    // Берем реального юзера. Если кук нет — getUser сам кинет redirect("/login")
    const { user } = await getUser(request);
    return { user };
}

export default function AppLayout() {
    const { user } = useLoaderData<typeof loader>();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white">
            <Navbar user={user} />

            <main className="flex-1 flex flex-col w-full">
                <Outlet />
            </main>

            <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
                <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-400">
                    <div>© 2026 Webflancer Ecosystem. Все права защищены.</div>
                    <div className="flex space-x-4">
                        <span className="hover:text-slate-600 cursor-pointer">Помощь</span>
                        <span className="hover:text-slate-600 cursor-pointer">Правила биржи</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}