import { commitSession, destroySession, getSession } from "~/shared/utils/session.server";
import { redirect } from "react-router";
import { api } from "~/shared/utils/api.server";
import type { UserProfile } from "../../features/user/shared/model";

const activeRefreshPromises = new Map<string, Promise<any>>();

export async function getUser(request: Request): Promise<{ user: UserProfile, token: string }> {
    const session = await getSession(request.headers.get("Cookie"));
    const accessToken = session.get("accessToken");
    const refreshToken = session.get("refreshToken");

    if (!accessToken) {
        throw redirect("/login", {
            headers: { "Set-Cookie": await destroySession(session) }
        });
    }

    try {
        // Запрос профиля текущего пользователя
        const response = await api.get('/users/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return { user: response.data, token: accessToken };
    } catch (error: any) {
        if (error.response?.status !== 401 || !refreshToken) {
            throw redirect("/login", {
                headers: { "Set-Cookie": await destroySession(session) }
            });
        }

        try {
            let refreshData;

            if (activeRefreshPromises.has(refreshToken)) {
                refreshData = await activeRefreshPromises.get(refreshToken);
            } else {
                // Путь к рефрешу токенов на бэкенде друга
                const refreshPromise = api.post('/auth/refresh', { refreshToken }).then(res => res.data);
                activeRefreshPromises.set(refreshToken, refreshPromise);

                try {
                    refreshData = await refreshPromise;
                } finally {
                    setTimeout(() => activeRefreshPromises.delete(refreshToken), 2000);
                }
            }

            const { accessToken: newAccess, refreshToken: newRefresh } = refreshData;

            session.set("accessToken", newAccess);
            session.set("refreshToken", newRefresh);

            throw redirect(request.url, {
                headers: { 'Set-Cookie': await commitSession(session) }
            });
        } catch (refreshError: any) {
            if (refreshError instanceof Response) throw refreshError;

            throw redirect("/login", {
                headers: { 'Set-Cookie': await destroySession(session) }
            });
        }
    }
}

export async function requireAuth(request: Request) {
    const { user, token } = await getUser(request);

    return {
        user,
        token,
        headers: { Authorization: `Bearer ${token}` }
    };
}

export async function requireRole(request: Request, allowedRoles: ("CLIENT" | "DEVELOPER")[]) {
    const auth = await requireAuth(request);

    if (!allowedRoles.includes(auth.user.role as any)) {
        throw new Response('Forbidden', { status: 403 });
    }

    return auth;
}