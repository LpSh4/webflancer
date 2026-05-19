import { type RouteConfig, index, route, prefix, layout } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), // Главная страница (лендинг или общая лента)

    // Авторизация
    route("login", "routes/auth/login.tsx"),
    route("register", "routes/auth/register.tsx"),

    // Авторизованная зона
    // layout('routes/layouts/app-layout.tsx', [
    //     route("profile", "routes/users/profile.tsx"), // Личный кабинет
    //     route("commissions", "routes/commissions/feed.tsx"), // Лента всех заказов
    //     route("commissions/:id", "routes/commissions/view.tsx"), // Просмотр заказа
    //
    //     // Зона Клиента
    //     layout('routes/layouts/client-layout.tsx', [
    //         route("client/dashboard", "routes/client/dashboard.tsx"),
    //         route("commissions/create", "routes/commissions/create.tsx"),
    //     ]),
    //
    //     // Зона Исполнителя
    //     layout('routes/layouts/developer-layout.tsx', [
    //         route("developer/dashboard", "routes/developer/dashboard.tsx"),
    //         route("developer/bids", "routes/developer/my-bids.tsx"), // Мои отклики
    //     ]),
    // ]),
] satisfies RouteConfig;