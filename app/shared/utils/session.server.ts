import {createCookieSessionStorage} from "react-router";

export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "_onboard_session",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secrets: ["super-secret-key-replace-in-prod"],
        secure: true,
        maxAge: 60 * 60 * 24 * 7,
    }
});

export const {getSession, commitSession, destroySession} = sessionStorage;
