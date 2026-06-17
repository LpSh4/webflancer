import { z } from "zod";

export const createCommissionSchema = z.object({
    type: z.string().min(1, "Выберите категорию проекта"),
    title: z.string()
        .min(5, "Название должно быть не короче 5 символов")
        .max(100, "Название не должно превышать 100 символов"),
    description: z.string()
        .min(20, "Опишите проект подробнее (минимум 20 символов)")
        .max(2000, "ТЗ слишком длинное (максимум 2000 символов)"),
    functionality: z.string().max(1000, "Максимум 1000 символов").optional(),
    designLink: z.string().trim().optional(), // Нормализацию сделаем в компоненте
    budgetMin: z.coerce.number()
        .min(10, "Минимальный бюджет — 10$")
        .max(1000000, "Слишком большой бюджет"),
    budgetMax: z.coerce.number()
        .max(1000000, "Слишком большой бюджет")
        .optional()
        .nullable(),
    deadLine: z.string()
        .optional()
        .nullable()
        .refine((val) => {
            if (!val) return true;
            const date = new Date(val);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date >= today;
        }, { message: "Дедлайн не может быть в прошлом" }),
}).refine((data) => {
    if (data.budgetMax && data.budgetMin > data.budgetMax) {
        return false;
    }
    return true;
}, {
    message: "Максимальный бюджет не может быть меньше минимального",
    path: ["budgetMax"], // Ошибка привяжется к полю budgetMax
});