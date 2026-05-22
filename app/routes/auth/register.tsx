import { Form, redirect, useActionData, useNavigation, Link } from "react-router";
import type { Route } from "./+types/register";
import { api } from "~/shared/utils/api.server";
import { Input } from "~/shared/ui/Input";
import { Button } from "~/shared/ui/Button";
import { Logo } from "~/shared/ui/Logo";
import { registerSchema } from "~/features/auth/auth.schema";

export function meta(_: Route.MetaArgs) {
    return [{ title: "Webflancer — Регистрация" }];
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = registerSchema.safeParse(data);

    if (!result.success) {
        return {
            fieldErrors: result.error.flatten().fieldErrors,
            error: null,
        };
    }

    try {
        // 1. Создаем аккаунт
        await api.post('/auth/register', result.data);

        // 2. Сразу логинимся, чтобы бэкенд сгенерировал токены (куки)
        const loginResponse = await api.post('/auth/login', {
            login: result.data.login,
            password: result.data.password
        });

        // 3. Забираем куки
        const setCookieHeaders = loginResponse.headers['set-cookie'];
        const headers = new Headers();

        if (Array.isArray(setCookieHeaders)) {
            setCookieHeaders.forEach(cookie => headers.append('Set-Cookie', cookie));
        }

        const role = loginResponse.data.user.role;
        const redirectUrl = role === 'CLIENT' ? '/client/dashboard' : '/developer/dashboard';

        // 4. Редиректим и клеим куки в браузер
        return redirect(redirectUrl, { headers });
    } catch (error: any) {
        return {
            error: error.response?.data?.message || "Ошибка при регистрации. Возможно, логин или email уже заняты.",
            fieldErrors: null,
        };
    }
}

export default function RegisterPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 py-12">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Logo size="md" className="text-slate-900" />
                </div>
                <RegisterCard />
                <p className="text-center text-slate-400 text-xs mt-8 font-medium">
                    © 2026 Webflancer Digital System
                </p>
            </div>
        </div>
    );
}

function RegisterCard() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Создать аккаунт</h2>
            <p className="text-slate-500 text-sm mb-6">Присоединяйтесь к экосистеме фриланса</p>

            {actionData?.error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center">
                    {actionData.error}
                </div>
            )}

            <Form method="post" className="space-y-4">
                <div className="flex gap-4 mb-2">
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name="role" value="CLIENT" className="peer sr-only" defaultChecked />
                        <div className="text-center px-4 py-2 border border-slate-200 rounded-lg peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900 transition-colors text-sm font-medium text-slate-600 hover:bg-slate-50">
                            Я Заказчик
                        </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" name="role" value="DEVELOPER" className="peer sr-only" />
                        <div className="text-center px-4 py-2 border border-slate-200 rounded-lg peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900 transition-colors text-sm font-medium text-slate-600 hover:bg-slate-50">
                            Я Разработчик
                        </div>
                    </label>
                </div>
                {actionData?.fieldErrors?.role && <p className="text-red-500 text-xs mt-1">{actionData.fieldErrors.role[0]}</p>}

                <Input label="Имя и Фамилия" name="name" required placeholder="Иван Иванов" error={actionData?.fieldErrors?.name?.[0]} />
                <Input label="Логин" name="login" required placeholder="ivan_dev" error={actionData?.fieldErrors?.login?.[0]} />
                <Input label="Email" name="email" type="email" required placeholder="ivan@example.com" error={actionData?.fieldErrors?.email?.[0]} />
                <Input label="Телефон" name="phoneNumber" required placeholder="89001234567" error={actionData?.fieldErrors?.phoneNumber?.[0]} />
                <Input label="Пароль" name="password" type="password" required placeholder="••••••••" error={actionData?.fieldErrors?.password?.[0]} />

                <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full py-3 mt-6">
                    {isSubmitting ? "Создание..." : "Зарегистрироваться"}
                </Button>
            </Form>

            <p className="text-center text-sm text-slate-500 mt-6">
                Уже есть аккаунт? <Link to="/login" className="text-blue-600 hover:underline">Войти</Link>
            </p>
        </div>
    );
}