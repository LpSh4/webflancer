import type {ProfileData} from "app/features/user/shared/profile/model";
import {AdaptationCard, ChecklistCard} from "app/features/user/shared/profile/components/intern/StatsRow";
import {ActivityChart} from "app/features/user/shared/profile/components/intern/ActivityChart";
import {MentorCard, SkillsCard} from "app/features/user/shared/profile/components/intern/SkillsAndMentor";
import {LogoutButton} from "app/features/user/shared/profile/components/LogoutButton";

export function InternDetailedContent({profile}: { profile: ProfileData }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8 min-w-0">

            <div className="col-span-1 lg:col-span-8 flex flex-col gap-4 md:gap-6 lg:gap-8 min-w-0">
                <AdaptationCard
                    percent={profile.adaptationPercent}
                    tasksCompleted={profile.tasksCompleted}
                    tasksRemaining={profile.tasksRemaining}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 min-w-0">
                    <ChecklistCard completed={profile.tasksCompleted} total={profile.tasksTotal}/>
                    <ActivityChart data={profile.activity}/>
                </div>
            </div>

            <div className="col-span-1 lg:col-span-4 flex flex-col gap-4 md:gap-6 lg:gap-8 min-w-0">
                <SkillsCard skills={profile.skills}/>
                {profile.mentor ? (
                    <MentorCard mentor={profile.mentor}/>
                ) : (
                    <div
                        className="glass-panel p-8 flex items-center justify-center text-slate-500 text-xs rounded-3xl md:rounded-4xl text-center border border-white/5">
                        Наставник пока не назначен
                    </div>
                )}
                <div className="mt-auto pt-2">
                    <LogoutButton/>
                </div>
            </div>

        </div>
    );
}