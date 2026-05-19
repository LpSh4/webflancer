import { Form, redirect, useActionData, useNavigation, Link } from "react-router";
import type { Route } from "./+types/register";
import { api } from "~/shared/utils/api.server";
import { Input } from "~/shared/ui/Input";
import { Button } from "~/shared/ui/Button";
import { Logo } from "~/shared/ui/Logo";
import { registerSchema } from "~/features/auth/auth.schema";

export function meta(_: Route.MetaArgs) {
    return [{ title: "Platform — Регистрация" }];
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
        await api.post('/auth/register', result.data);
        // После успешной регистрации отправляем на логин
        return redirect('/login');
    } catch (error: any) {
        return {
            error: error.response?.data?.message || "Ошибка при регистрации. Возможно, логин или email уже заняты.",
            fieldErrors: null,
        };
    }
}

export default function RegisterPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Logo size="md" className="text-slate-900" />
                </div>
                <RegisterCard />
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
            <p className="text-slate-500 text-sm mb-6">Присоединяйтесь к платформе</p>

            {actionData?.error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center">
                    {actionData.error}
                </div>
            )}

            <Form method="post" className="space-y-4">
                <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-slate-700">Я хочу...</label>
                    <select
                        name="role"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        defaultValue="CLIENT"
                    >
                        <option value="CLIENT">Создавать заказы (Клиент)</option>
                        <option value="DEVELOPER">Искать работу (Исполнитель)</option>
                    </select>
                    {actionData?.fieldErrors?.role && (
                        <p className="text-xs text-red-500">{actionData.fieldErrors.role}</p>
                    )}
                </div>

                <Input
                    label="Логин"
                    name="login"
                    required
                    placeholder="ivan_ivanov"
                    error={actionData?.fieldErrors?.login?.[0]}
                />

                <Input
                    label="Отображаемое имя"
                    name="displayedName"
                    required
                    placeholder="Иван Иванов"
                    error={actionData?.fieldErrors?.displayedName?.[0]}
                />

                <Input
                    label="Email"
                    name="email"
                    type="email"
                    required
                    placeholder="ivan@example.com"
                    error={actionData?.fieldErrors?.email?.[0]}
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
                    {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
                </Button>
            </Form>

            <p className="text-center text-sm text-slate-500 mt-6">
                Уже есть аккаунт? <Link to="/login" className="text-blue-600 hover:underline">Войти</Link>
            </p>
        </div>
    );
}