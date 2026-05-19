import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration, useRouteLoaderData, Link,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import type { UserProfile } from "~/features/user/model";
import { getUser } from "~/shared/utils/auth.server";
import { apiClient } from "~/shared/utils/api.client";
import { useEffect } from "react";

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);

    // 1. Если это страница логина, регистрации ИЛИ главная (лендинг) — не требуем авторизацию
    if (
        url.pathname === '/' ||
        url.pathname.includes('/login') ||
        url.pathname.includes('/register')
    ) {
        try {
            const { getSession } = await import("~/shared/utils/session.server");
            const session = await getSession(request.headers.get("Cookie"));
            const accessToken = session.get("accessToken");

            if (accessToken) {
                const { getUser } = await import("~/shared/utils/auth.server");
                const { user, token } = await getUser(request);
                return { user, token };
            }
        } catch (e) {
            // Если токен протух или что-то пошло не так, просто гасим ошибку
            // и отдаем null, чтобы не ломать просмотр главной страницы
        }

        return { user: null, token: null };
    }

    // 2. Для всех остальных приватных страниц компании — жесткий контроль
    try {
        const { user, token } = await getUser(request);
        return { user, token };
    } catch (error) {
        if (error instanceof Response) throw error;
        return { user: null, token: null };
    }
}

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru" className="h-full bg-slate-50">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <Meta />
            <Links />
            <title>OnboardMe</title>
        </head>
        <body className="h-full text-slate-900 antialiased bg-slate-50">
        <div className="min-h-full flex flex-col">
            {children}
        </div>
        <ScrollRestoration />
        <Scripts />
        </body>
        </html>
    );
}

export default function App() {
    const user = useUser();
    const token = useAuthToken();

    useEffect(() => {
        if (!user || !token) return;

        const pingOnline = () => {
            apiClient.post('/users/me/ping', {}, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => {});
        };

        pingOnline();
        const intervalId = setInterval(pingOnline, 60000);

        return () => clearInterval(intervalId);
    }, [user, token]);

    return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Упс!";
    let details = "Произошла ошибка.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : `Ошибка ${error.status}`;
        details = error.status === 404 ? "Страница не найдена." : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
            <div className="max-w-md w-full">
                <h1 className="text-5xl font-black text-slate-900 mb-2">{message}</h1>
                <p className="text-sm text-slate-500 mb-6">{details}</p>
                <Link to="/" className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors">
                    На главную
                </Link>
                {stack && (
                    <div className="mt-6 text-left bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto">
                        <pre className="text-xs text-slate-600 font-mono"><code>{stack}</code></pre>
                    </div>
                )}
            </div>
        </main>
    );
}

export function useUser() {
    const rootData = useRouteLoaderData('root') as { user: UserProfile | null } | undefined;
    return rootData?.user;
}

export function useAuthToken() {
    const rootData = useRouteLoaderData('root') as { token: string | null } | undefined;
    return rootData?.token;
}