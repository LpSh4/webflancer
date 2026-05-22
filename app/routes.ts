import {type RouteConfig, index, route, layout} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), // Главная страница (промо-лендинг)

    // Авторизация (вход/регистрация)
    route("login", "routes/auth/login.tsx"),
    route("register", "routes/auth/register.tsx"),

    // Основная рабочая зона под защитой авторизации и с Сайдбаром
    layout("routes/layouts/app-layout.tsx", [
        route("logout", "routes/auth/logout.tsx"),

        // Общие роуты для заказов
        route("commissions", "routes/commissions/feed.tsx"),        // Лента всех заказов
        route("commissions/:id", "routes/commissions/view.tsx"),    // Детали заказа + ставки (Bids)

        // Личный кабинет / Настройки профиля
        route("profile", "routes/users/profile.tsx"),
        route("users/:id", "routes/users/view.tsx"),

        // Дашборд Разработчика (Фрилансера)
        route("developer/dashboard", "routes/developer/dashboard.tsx"),

        // Дашборд Клиента (Заказчика)
        route("client/dashboard", "routes/client/dashboard.tsx"),
        route("workspace/:id", "routes/workspace/workspace.tsx"),


        route("chat/:orderId", "routes/chat/chat.tsx"),

    ]),
] satisfies RouteConfig;