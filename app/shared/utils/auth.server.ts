import { redirect } from "react-router";
import { api } from "~/shared/utils/api.server";
import type { UserProfile } from "~/features/user/shared/model";

export async function getUser(request: Request): Promise<{ user: UserProfile }> {
    const cookieHeader = request.headers.get("Cookie");

    if (!cookieHeader || !cookieHeader.includes("access_token")) {
        throw redirect("/login", {
            headers: [["Set-Cookie", "access_token=; Max-Age=0; Path=/"]]
        });
    }

    try {
        const response = await api.get('/users/me', {
            headers: { Cookie: cookieHeader }
        });
        return { user: response.data };

    } catch (error: any) {
        if (error.response?.status !== 401 || !cookieHeader.includes("refresh_token")) {
            throw redirect("/login", {
                headers: [["Set-Cookie", "access_token=; Max-Age=0; Path=/"]]
            });
        }

        console.log("[Auth Server] Access token expired. Initializing refresh flow.");

        try {
            const refreshResponse = await api.post('/auth/refresh', {}, {
                headers: { Cookie: cookieHeader }
            });

            const setCookieHeaders = refreshResponse.headers['set-cookie'];
            const headers = new Headers();

            if (setCookieHeaders) {
                const cookiesArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];

                cookiesArray.forEach(cookie => {
                    const cleanCookie = cookie.replace(/;\s*expires=[^;]+/gi, '');
                    headers.append('Set-Cookie', cleanCookie);
                });
            }

            console.log("[Auth Server] Refresh successful. Redirecting to requested URL.");
            throw redirect(request.url, { headers });

        } catch (refreshError: any) {
            if (refreshError instanceof Response) throw refreshError;

            console.error("[Auth Server] Refresh failed. Session expired or invalid token.");

            const headers = new Headers();
            headers.append("Set-Cookie", "access_token=; Max-Age=0; Path=/");
            headers.append("Set-Cookie", "refresh_token=; Max-Age=0; Path=/");

            throw redirect("/login", { headers });
        }
    }
}

export async function requireAuth(request: Request) {
    const { user } = await getUser(request);
    return { user };
}

export async function requireRole(request: Request, allowedRoles: ("CLIENT" | "DEVELOPER")[]) {
    const auth = await requireAuth(request);
    if (!allowedRoles.includes(auth.user.role as any)) {
        throw new Response('Forbidden', { status: 403 });
    }
    return auth;
}