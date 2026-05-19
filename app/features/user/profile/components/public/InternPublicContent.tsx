import type {ProfileData} from "~/features/user/profile/model";
import {IoBriefcaseOutline, IoCheckmarkCircleOutline, IoMailOutline} from "react-icons/io5";
import {SkillsCard} from "~/features/user/profile/components/intern/SkillsAndMentor";
import {ContactRow} from "~/features/user/profile/components/shared/ContactRow";
export function InternPublicContent({profile}: { profile: ProfileData }) {
    return (
        <div className="glass-panel p-10 rounded-4xl border border-white/5 flex flex-col md:flex-row gap-10">
            <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-6">О коллеге</h2>
                <div className="space-y-4">
                    <ContactRow icon={<IoMailOutline/>} label="Email" value={profile.email || "Скрыт"}/>
                    <ContactRow icon={<IoBriefcaseOutline/>} label="Должность" value={profile.position?.name}/>
                    <ContactRow icon={<IoCheckmarkCircleOutline/>} label="Адаптация"
                                value={profile.adaptationPercent === 100 ? "Завершил(а)" : "В процессе"}/>
                </div>
            </div>
            <div className="w-full md:w-80 shrink-0">
                <SkillsCard skills={profile.skills}/>
            </div>
        </div>
    );
}