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
            setCookieHeaders.forEach(cookie => {
                const cleanCookie = cookie.replace(/;\s*expires=[^;]+/gi, '');
                headers.append('Set-Cookie', cleanCookie);
            });
        }

        const role = loginResponse.data.user.role;
        const redirectUrl = role === 'CLIENT' ? '/client/dashboard' : '/developer/dashboard';

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
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <Logo size="md" className="text-slate-900" />
                    </Link>
                </div>
                <RegisterCard />
                <p className="text-center text-slate-400 text-xs mt-8 font-medium tracking-wide">
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight text-center">Создать аккаунт</h2>
            <p className="text-slate-500 text-xs mb-6 text-center">Присоединяйтесь к экосистеме фриланса</p>

            {actionData?.error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium text-center">
                    {actionData.error}
                </div>
            )}

            <Form method="post" className="space-y-4">

                {/* Свитчер выбора роли */}
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mb-2">
                    <label className="flex-1 cursor-pointer relative">
                        <input type="radio" name="role" value="CLIENT" className="peer sr-only" defaultChecked />
                        <div className="text-center px-4 py-2 rounded-lg peer-checked:bg-white peer-checked:shadow-sm peer-checked:text-slate-900 transition-all text-xs font-bold text-slate-500 hover:text-slate-700">
                            Я Заказчик
                        </div>
                    </label>
                    <label className="flex-1 cursor-pointer relative">
                        <input type="radio" name="role" value="DEVELOPER" className="peer sr-only" />
                        <div className="text-center px-4 py-2 rounded-lg peer-checked:bg-white peer-checked:shadow-sm peer-checked:text-slate-900 transition-all text-xs font-bold text-slate-500 hover:text-slate-700">
                            Я Разработчик
                        </div>
                    </label>
                </div>
                {actionData?.fieldErrors?.role && <p className="text-red-500 text-[10px] font-medium mt-1 pl-1">{actionData.fieldErrors.role[0]}</p>}

                {/* Раздельные поля для Имени и Фамилии */}
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Имя"
                        name="name"
                        required
                        placeholder="Иван"
                        error={actionData?.fieldErrors?.name?.[0]}
                    />
                    <Input
                        label="Фамилия"
                        name="surname"
                        placeholder="Иванов (опц.)"
                        error={actionData?.fieldErrors?.surname?.[0]}
                    />
                </div>

                <Input label="Логин" name="login" required minLength={3} placeholder="ivan_dev" error={actionData?.fieldErrors?.login?.[0]} />
                <Input label="Email" name="email" type="email" required placeholder="ivan@example.com" error={actionData?.fieldErrors?.email?.[0]} />

                <Input
                    label="Телефон"
                    name="phoneNumber"
                    required
                    pattern="^89\d{9}$"
                    placeholder="89001234567"
                    error={actionData?.fieldErrors?.phoneNumber?.[0]}
                    title="Формат: 89XXXXXXXXX"
                />

                <Input label="Пароль" name="password" type="password" required minLength={6} placeholder="••••••••" error={actionData?.fieldErrors?.password?.[0]} />

                <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full py-3 mt-6">
                    {isSubmitting ? "Создание..." : "Зарегистрироваться"}
                </Button>
            </Form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-medium">
                    Уже есть аккаунт? <Link to="/login" className="text-blue-600 font-bold hover:underline">Войти</Link>
                </p>
            </div>
        </div>
    );
}