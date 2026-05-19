import {Outlet} from "react-router";
import {Sidebar} from "~/shared/components/sidebar/Sidebar";
import {requireAuth} from "~/shared/utils/auth.server";
import type {Route} from "./+types/app-layout";
import {useLoaderData} from "react-router";
import {useHeartbeat} from "~/shared/hooks/useHeartbeat";

export async function loader({request}: Route.LoaderArgs) {
    return await requireAuth(request);
}

export default function AppLayout() {
    const {user} = useLoaderData<typeof loader>();
    useHeartbeat(user);
    return (
        <div className="flex h-screen overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
            <Sidebar user={user}/>
            <main className="flex-1 flex flex-col overflow-hidden">
                <Outlet/>
            </main>
        </div>
    );
}