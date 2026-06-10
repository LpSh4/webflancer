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
        const response = await api.post('/auth/login', result.data);

        const setCookieHeaders = response.headers['set-cookie'];
        const headers = new Headers();

        if (setCookieHeaders) {
            const cookiesArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
            cookiesArray.forEach(cookie => {
                const cleanCookie = cookie.replace(/;\s*expires=[^;]+/gi, '');
                headers.append('Set-Cookie', cleanCookie);
            });
        }

        const role = response.data.user.role;
        const redirectUrl = role === 'CLIENT' ? '/client/dashboard' : '/developer/dashboard';

        return redirect(redirectUrl, { headers });
    } catch (error: any) {
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
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <Logo size="md" className="text-slate-900" />
                    </Link>
                </div>
                <LoginCard />
                <p className="text-center text-slate-400 text-xs mt-8 font-medium tracking-wide">
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight text-center">С возвращением</h2>
            <p className="text-slate-500 text-xs mb-6 text-center">Войдите в систему, чтобы продолжить работу</p>

            {actionData?.error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium text-center shadow-sm">
                    {actionData.error}
                </div>
            )}

            <Form method="post" className="space-y-4">
                <Input
                    label="Логин"
                    name="login"
                    required
                    minLength={3}
                    placeholder="Укажите ваш логин"
                    error={actionData?.fieldErrors?.login?.[0]}
                />

                <Input
                    label="Пароль"
                    name="password"
                    type="password"
                    required
                    minLength={6}
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

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-medium">
                    Нет аккаунта? <Link to="/register" className="text-blue-600 font-bold hover:underline">Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    );
}