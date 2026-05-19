import {useEffect} from "react";
import {apiClient} from "~/shared/utils/api.client";
import {useAuthToken, useUser} from "~/root";

export function useHeartbeat() {
    const user = useUser();
    const token = useAuthToken();

    useEffect(() => {
        if (!user || !token) return;

        const pingOnline = () => {
            apiClient.patch(`/users/me/last-online`,
                {lastOnline: new Date().toISOString()},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            ).catch(console.error);
        };

        pingOnline();

        const interval = setInterval(pingOnline, 1000 * 60 * 3);

        return () => clearInterval(interval);
    }, [user, token]);
}