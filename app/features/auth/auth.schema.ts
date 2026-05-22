import { z } from "zod";

export const registerSchema = z.object({
    login: z.string()
        .min(3, "Минимум 3 символа")
        .max(50, "Логин максимум 50 символов")
        .regex(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и _"),
    password: z.string()
        .min(6, "Минимум 6 символов")
        .max(128, "Пароль слишком длинный"),
    role: z.enum(["CLIENT", "DEVELOPER"], {
        message: "Выберите тип аккаунта"
    }),
    email: z.string()
        .email("Неверный email")
        .max(255),
    name: z.string() // Переименовали с displayedName
        .min(1, "Введите имя")
        .max(100, "Имя максимум 100 символов"),
    phoneNumber: z.string() // Добавили телефон
        .regex(/^89\d{9}$/, "Формат: 89XXXXXXXXX (11 цифр)"),
});

export const loginSchema = z.object({
    login: z.string().min(1, "Введите логин").max(50),
    password: z.string().min(1, "Введите пароль").max(128),
});

export const refreshOrLogoutSchema = z.object({
    refreshToken: z.string().min(1).max(1024),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;