import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { api } from "~/shared/utils/api.server";

export async function action({ request }: Route.ActionArgs) {
    try {
        // Говорим бэкенду убить сессию в базе (передаем текущие куки)
        await api.post('/auth/logout', {}, {
            headers: { Cookie: request.headers.get("Cookie") || "" }
        });
    } catch (e) {
        // Если токен уже протух и бэк ругнулся, нам все равно — идем дальше стирать локально
    }

    // Жестко затираем куки в браузере, ставя Max-Age=0
    const headers = new Headers();
    headers.append("Set-Cookie", "access_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax");
    headers.append("Set-Cookie", "refresh_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax");

    return redirect("/login", { headers });
}

// Если юзер случайно перейдет по GET-запросу на /logout, просто кидаем на главную
export async function loader() {
    return redirect("/");
}