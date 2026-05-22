import { Form, redirect, useActionData, useNavigation, Link } from "react-router";
import type { Route } from "./+types/login";
import { api } from "~/shared/utils/api.server";
import { Input } from "~/shared/ui/Input";
import { Button } from "~/shared/ui/Button";
import { Logo } from "~/shared/ui/Logo";
import { loginSchema } from "~/features/auth/auth.schema";

export function meta(_: Route.MetaArgs) {
    return [{ title: "Webflancer — Вход" }];
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const result = loginSchema.safeParse(data);

    if (!result.success) {
        return { fieldErrors: result.error.flatten().fieldErrors, error: null };
    }

    try {
        console.log(`\n🚀 [LOGIN ACTION] Отправляем POST на бэкенд...`);
        const response = await api.post('/auth/login', result.data);

        const setCookieHeaders = response.headers['set-cookie'] || response.headers.get?.('set-cookie');
        const headers = new Headers();

        if (setCookieHeaders) {
            const cookiesArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];

            cookiesArray.forEach(cookie => {
                // РЕГУЛЯРКА: Вырезаем "; Expires=..." вместе с его запятой, оставляя только Max-Age
                const cleanCookie = cookie.replace(/;\s*expires=[^;]+/gi, '');

                console.log(`   - Отправляем в браузер чистую куку: ${cleanCookie.substring(0, 40)}...`);
                headers.append('Set-Cookie', cleanCookie);
            });
        }

        const role = response.data.user.role;
        const redirectUrl = role === 'CLIENT' ? '/client/dashboard' : '/developer/dashboard';

        return redirect(redirectUrl, { headers });

    } catch (error: any) {
        console.error("🚨 Ошибка при логине:", error.message);
        return {
            error: error.response?.data?.message || "Неверный логин или пароль.",
            fieldErrors: null,
        };
    }
}

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Logo size="md" className="text-slate-900" />
                </div>
                <LoginCard />
                <p className="text-center text-slate-400 text-xs mt-8 font-medium">
                    © 2026 Webflancer Digital System
                </p>
            </div>
        </div>
    );
}

function LoginCard() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">С возвращением</h2>
            <p className="text-slate-500 text-sm mb-6">Войдите в систему, чтобы продолжить работу</p>

            {actionData?.error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center">
                    {actionData.error}
                </div>
            )}

            <Form method="post" className="space-y-5">
                <Input
                    label="Логин"
                    name="login"
                    required
                    placeholder="Укажите ваш логин"
                    error={actionData?.fieldErrors?.login?.[0]}
                />

                <Input
                    label="Пароль"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    error={actionData?.fieldErrors?.password?.[0]}
                />

                <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full py-3 mt-4"
                >
                    {isSubmitting ? "Вход..." : "Войти"}
                </Button>
            </Form>

            <p className="text-center text-sm text-slate-500 mt-6">
                Нет аккаунта? <Link to="/register" className="text-blue-600 hover:underline">Зарегистрироваться</Link>
            </p>
        </div>
    );
}