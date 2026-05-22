import { useLoaderData, useActionData, useNavigation, Form } from "react-router";
import type { Route } from "./+types/profile";
import { getUser } from "~/shared/utils/auth.server";
import { api } from "~/shared/utils/api.server";
import { ProfileInfoCard } from "~/features/user/ui/ProfileInfoCard";
import { useState } from "react";
import { Input } from "~/shared/ui/Input";
import { Button } from "~/shared/ui/Button";
import { CheckCircle2, AlertCircle, X, Plus } from "lucide-react";

interface FullUserProfile {
    id: string;
    role: "DEVELOPER" | "CLIENT" | "MODERATOR";
    login: string;
    email: string;
    phoneNumber: string;
    name: string;
    surname?: string;
    displayedName: string;
    profileStatus?: string;
    bio?: string;
    avgHourlyRate?: number;
    companyName?: string;
    companyLink?: string;
    socialLinkedIn?: string;
    socialX?: string;
    socialGitHub?: string;
    portfolioLinks?: string[];
    averageRating?: number;
}

export async function loader({ request }: Route.LoaderArgs) {
    const { user } = await getUser(request);
    const links = (user as any).portfolioLinks || [];

    return { user: user as FullUserProfile, initialLinks: links };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const cookieHeader = request.headers.get("Cookie");

    const updateData: Record<string, any> = {
        name: formData.get("name") as string,
        surname: formData.get("surname") as string,
        displayedName: formData.get("displayedName") as string,
        phoneNumber: formData.get("phoneNumber") as string,
        login: formData.get("login") as string,
    };

    const role = formData.get("role") as string;

    if (role === "DEVELOPER") {
        updateData.bio = formData.get("bio") as string;

        const rate = formData.get("avgHourlyRate");
        if (rate) updateData.avgHourlyRate = Number(rate);

        const github = formData.get("socialGitHub") as string;
        if (github) updateData.socialGitHub = github;

        const linkedIn = formData.get("socialLinkedIn") as string;
        if (linkedIn) updateData.socialLinkedIn = linkedIn;

        const x = formData.get("socialX") as string;
        if (x) updateData.socialX = x;

        const links = formData.getAll("portfolioLinks");
        updateData.portfolioLinks = links;

    } else if (role === "CLIENT") {
        updateData.companyName = formData.get("companyName") as string;
        const link = formData.get("companyLink") as string;
        if (link) updateData.companyLink = link;
    }

    try {
        await api.patch('/users/profile', updateData, {
            headers: { Cookie: cookieHeader }
        });
        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Не удалось сохранить профиль" };
    }
}

export default function ProfilePage() {
    const { user, initialLinks } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [links, setLinks] = useState<string[]>(initialLinks);
    const [newLink, setNewLink] = useState("");

    const handleAddLink = () => {
        if (newLink && !links.includes(newLink)) {
            setLinks([...links, newLink]);
            setNewLink("");
        }
    };

    const handleRemoveLink = (linkToRemove: string) => {
        setLinks(links.filter(l => l !== linkToRemove));
    };

    return (
        <div className="flex-1 bg-slate-50 min-h-screen py-10">
            <div className="max-w-6xl mx-auto px-6">
                <div className="border-b border-slate-200 pb-5 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Настройки профиля</h1>
                        <p className="text-xs text-slate-500 mt-1">Управление личными данными и конфигурацией аккаунта</p>
                    </div>
                </div>

                {actionData?.success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Профиль успешно обновлен!
                    </div>
                )}
                {actionData?.error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        Ошибка: {actionData.error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div>
                        <ProfileInfoCard user={user as any} />
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-5">
                                Базовая информация
                            </h3>

                            <Form method="post" className="space-y-4">
                                <input type="hidden" name="role" value={user.role} />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Имя" name="name" defaultValue={user.name} required />
                                    <Input label="Фамилия" name="surname" defaultValue={user.surname || ""} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Отображаемое имя" name="displayedName" defaultValue={user.displayedName} required />
                                    <Input label="Уникальный логин" name="login" defaultValue={user.login} required />
                                </div>

                                <Input label="Номер телефона" name="phoneNumber" defaultValue={user.phoneNumber} required placeholder="89001234567" />

                                {user.role === "DEVELOPER" && (
                                    <>
                                        <div className="pt-4 mt-4 border-t border-slate-100">
                                            <label className="text-xs font-medium text-slate-700 mb-1.5 ml-0.5 block">О себе (Bio)</label>
                                            <textarea name="bio" defaultValue={user.bio || ""} rows={3} className="w-full bg-white border border-slate-200 focus:border-slate-900 focus:ring-slate-900/5 px-3 py-2 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all resize-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Ставка в час ($)" name="avgHourlyRate" type="number" defaultValue={user.avgHourlyRate || ""} />
                                            <Input label="GitHub" name="socialGitHub" type="url" defaultValue={user.socialGitHub || ""} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="LinkedIn" name="socialLinkedIn" type="url" defaultValue={user.socialLinkedIn || ""} />
                                            <Input label="X (Twitter)" name="socialX" type="url" defaultValue={user.socialX || ""} />
                                        </div>

                                        {links.map((link, index) => (
                                            <input key={index} type="hidden" name="portfolioLinks" value={link} />
                                        ))}
                                    </>
                                )}

                                {user.role === "CLIENT" && (
                                    <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                                        <Input label="Название компании" name="companyName" defaultValue={user.companyName || ""} />
                                        <Input label="Сайт компании" name="companyLink" type="url" defaultValue={user.companyLink || ""} />
                                    </div>
                                )}

                                <div>
                                    <Input label="Контактный Email" type="email" disabled value={user.email} className="bg-slate-50 text-slate-400 cursor-not-allowed" />
                                    <p className="text-[10px] text-slate-400 mt-1 ml-1">Изменение Email доступно в отдельном разделе.</p>
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="w-full mt-6">
                                    {isSubmitting ? "Сохранение..." : "Сохранить профиль"}
                                </Button>
                            </Form>
                        </div>

                        {user.role === "DEVELOPER" && (
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                                    Ссылки на портфолио
                                </h3>

                                <div className="flex flex-col gap-2">
                                    {links.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">Ссылок пока нет.</p>
                                    ) : (
                                        links.map((link) => (
                                            <div key={link} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                <a href={link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate max-w-[80%]">
                                                    {link}
                                                </a>
                                                <button type="button" onClick={() => handleRemoveLink(link)} className="text-slate-400 hover:text-red-500 p-1 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
                                    <Input
                                        type="url"
                                        value={newLink}
                                        onChange={(e) => setNewLink(e.target.value)}
                                        placeholder="https://..."
                                        wrapperClassName="flex-1"
                                    />
                                    <Button type="button" variant="secondary" onClick={handleAddLink}>
                                        <Plus className="w-4 h-4 mr-1" /> Добавить
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}