// import { Outlet, useLoaderData } from "react-router";
// import { requireAuth } from "~/shared/utils/auth.server";
// import { Navbar } from "~/shared/ui/Navbar";
// import type { Route } from "./+types/app-layout";
//
// export async function loader({ request }: Route.LoaderArgs) {
//     return await requireAuth(request);
// }
//
// export default function AppLayout() {
//     const { user } = useLoaderData<typeof loader>();
//
//     return (
//         <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white">
//             {/* Наш вынесенный компонент шапки */}
//             <Navbar user={user} />
//
//             {/* Контент страниц */}
//             <main className="flex-1 flex flex-col w-full">
//                 <Outlet />
//             </main>
//
//             {/* Минималистичный футер */}
//             <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
//                 <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-400">
//                     <div>© 2026 Webflancer Ecosystem. Все права защищены.</div>
//                     <div className="flex space-x-4">
//                         <span className="hover:text-slate-600 cursor-pointer">Помощь</span>
//                         <span className="hover:text-slate-600 cursor-pointer">Правила биржи</span>
//                     </div>
//                 </div>
//             </footer>
//         </div>
//     );
// }

import { Outlet, useLoaderData } from "react-router";
// Закомментируем на время верстки без бэка:
// import { requireAuth } from "~/shared/utils/auth.server";
import { Navbar } from "~/shared/ui/Navbar";
import type { Route } from "./+types/app-layout";

export async function loader({ request }: Route.LoaderArgs) {
    // Явно указываем тип роли, чтобы TS знал, что она может меняться
    const mockRole: "DEVELOPER" | "CLIENT" = "DEVELOPER"; // Поменяй на "CLIENT" для теста панели заказчика

    return {
        user: {
            displayedName: "Алексей Разработчик",
            role: mockRole,
        }
    };
}

export default function AppLayout() {
    const { user } = useLoaderData<typeof loader>();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white">
            {/* Наш вынесенный компонент шапки */}
            <Navbar user={user} />

            {/* Контент страниц */}
            <main className="flex-1 flex flex-col w-full">
                <Outlet />
            </main>

            {/* Минималистичный футер */}
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