import React, {useState, useRef, useEffect} from "react";
import type {ProfileData} from "app/features/user/shared/profile/model";
import {UserAvatar} from "app/shared/ui/UserAvatar";
import {Button} from "app/shared/ui/Button";
import {Modal} from "app/shared/ui/Modal";
import {Input} from "app/shared/ui/Input";
import {Link, useRevalidator} from "react-router";
import {IoSettingsOutline, IoChatbubblesOutline, IoLockClosedOutline, IoPersonOutline} from "react-icons/io5";
import {roleMap} from "app/shared/utils/ru_labels";
import {apiClient} from "app/shared/utils/api.client";

interface ProfileHeaderProps {
    profile: ProfileData;
    isSelf: boolean;
    canEdit: boolean;
    token: string;
}

type ModalTab = 'general' | 'security';

export function ProfileHeader({profile, isSelf, canEdit, token}: ProfileHeaderProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ModalTab>('general');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const {revalidate} = useRevalidator();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const displayRole = roleMap[profile.role] || profile.role;

    useEffect(() => {
        if (!selectedFile) setPreviewUrl(profile.avatar || null);
    }, [profile.avatar, selectedFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Сохранение общих данных
    const handleGeneralSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const textFormData = new FormData(e.currentTarget);
        const targetId = isSelf ? 'me' : profile.id;

        try {
            await apiClient.patch(`/users/${targetId}/profile`, {
                login: textFormData.get('login'),
                displayName: textFormData.get('displayName'),
                email: textFormData.get('email'),
                role: textFormData.get('role') || profile.role
            }, {headers: {"Authorization": `Bearer ${token}`}});

            if (selectedFile) {
                const fileData = new FormData();
                fileData.append("avatar", selectedFile);
                await apiClient.post(`/users/${targetId}/avatar`, fileData, {
                    headers: {"Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}`}
                });
            }
            setIsModalOpen(false);
            revalidate();
        } catch (err) {
            console.error("Ошибка обновления профиля", err);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(false);

        const formData = new FormData(e.currentTarget);
        const oldPassword = formData.get('oldPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (newPassword !== confirmPassword) {
            setPasswordError("Пароли не совпадают");
            return;
        }

        try {
            await apiClient.patch(`/users/me/password`, {
                oldPassword,
                newPassword
            }, {headers: {"Authorization": `Bearer ${token}`}});

            setPasswordSuccess(true);
            (e.target as HTMLFormElement).reset();
            // Можно закрыть модалку через пару секунд или попросить залогиниться заново
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || "Ошибка при смене пароля");
        }
    };

    return (
        <header
            className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-10 py-6 sm:py-8 gap-6 shrink-0">
            <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative shrink-0">
                    <UserAvatar src={previewUrl} name={profile?.displayName || profile?.login} size={96}
                                lastOnline={profile?.lastOnline} showStatus={true}/>
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{profile.displayName || profile.login}</h1>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                            className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">{displayRole}</span>
                        <span className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider">В команде с {profile.joinedAt}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 shrink-0">
                {!isSelf && (
                    <Link to={`/chat`} className="block">
                        <Button variant="secondary" className="cursor-pointer active:scale-95 transition-transform">
                            <IoChatbubblesOutline size={20}/>
                        </Button>
                    </Link>
                )}
                {canEdit && (
                    <Button variant="secondary" onClick={() => {
                        setIsModalOpen(true);
                        setActiveTab('general');
                    }} className="cursor-pointer active:scale-95 transition-transform">
                        <IoSettingsOutline size={20}/>
                    </Button>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                   title={isSelf ? "Настройки аккаунта" : "Редактирование профиля"}>
                {/* Вкладки */}
                {isSelf && (
                    <div className="flex gap-4 border-b border-white/5 mb-6">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`cursor-pointer pb-2 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${activeTab === 'general' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}
                        >
                            <IoPersonOutline size={16}/> Профиль
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`cursor-pointer pb-2 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${activeTab === 'security' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}
                        >
                            <IoLockClosedOutline size={16}/> Безопасность
                        </button>
                    </div>
                )}

                {activeTab === 'general' ? (
                    <form className="space-y-4" onSubmit={handleGeneralSubmit}>
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative cursor-pointer group"
                                 onClick={() => fileInputRef.current?.click()}>
                                <UserAvatar src={previewUrl} name={profile.displayName || profile.login} size={80}/>
                                <div
                                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span
                                        className="text-[9px] text-white font-bold uppercase tracking-widest">Изменить</span>
                                </div>
                            </div>
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef}
                                   onChange={handleFileChange}/>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Логин" name="login" defaultValue={profile.login} required/>
                            <Input label="Отображаемое имя" name="displayName" defaultValue={profile.displayName || ''}
                                   required/>
                        </div>
                        <Input label="Email" name="email" type="email" defaultValue={profile.email || ''}/>
                        {!isSelf && (
                            <div className="pt-2">
                                <label
                                    className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 ml-1">Роль
                                    в системе</label>
                                <select name="role" defaultValue={profile.role}
                                        className="w-full bg-[#0d1930]/50 border border-blue-500/10 h-[46px] px-4 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer">
                                    <option value="intern">Стажер</option>
                                    <option value="teamlead">Тимлид</option>
                                    <option value="hr">HR</option>
                                </select>
                            </div>
                        )}
                        <Button type="submit" className="w-full py-4 mt-2">Сохранить изменения</Button>
                    </form>
                ) : (
                    <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl mb-4">
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                После смены пароля все активные сессии на других устройствах будут завершены.
                            </p>
                        </div>

                        <Input label="Старый пароль" name="oldPassword" type="password" required
                               placeholder="••••••••"/>
                        <div className="h-px bg-white/5 my-2"/>
                        <Input label="Новый пароль" name="newPassword" type="password" required
                               placeholder="Минимум 6 символов"/>
                        <Input label="Подтвердите пароль" name="confirmPassword" type="password" required
                               placeholder="••••••••"/>

                        {passwordError &&
                            <p className="text-rose-500 text-[10px] font-bold uppercase ml-1">{passwordError}</p>}
                        {passwordSuccess &&
                            <p className="text-emerald-500 text-[10px] font-bold uppercase ml-1">Пароль успешно
                                изменен!</p>}

                        <Button type="submit" className="w-full py-4 mt-2">Обновить пароль</Button>
                    </form>
                )}
            </Modal>
        </header>
    );
}