import { z } from "zod";

export const createCommissionSchema = z.object({
    title: z.string()
        .min(5, "Название проекта должно быть не менее 5 символов")
        .max(255, "Слишком длинное название"),
    type: z.string().min(1, "Выберите категорию"),
    budgetMin: z.preprocess(
        (val) => (val === "" || val == null ? undefined : Number(val)),
        z.number({ message: "Укажите минимальный бюджет" })
            .min(1, "Минимальный бюджет должен быть больше 0")
            .max(99999999, "Бюджет превышает лимиты системы")
    ),
    budgetMax: z.preprocess(
        (val) => (val === "" || val == null ? undefined : Number(val)),
        z.number({ message: "Укажите корректное число" })
            .min(1, "Максимальный бюджет должен быть больше 0")
            .max(99999999, "Бюджет превышает лимиты системы")
            .optional()
    ),
    designLink: z.string()
        .trim()
        .transform((val) => (val === "" ? undefined : val))
        .pipe(z.string().url("Введите корректную ссылку (https://...)").optional()),
    deadLine: z.string()
        .transform((val) => (val === "" ? undefined : val))
        .optional(),
    description: z.string()
        .min(10, "Техническое задание должно содержать минимум 10 символов"),
    functionality: z.string().optional(),
}).refine((data) => {
    if (data.budgetMax && data.budgetMin > data.budgetMax) {
        return false;
    }
    return true;
}, {
    message: "Максимальный бюджет не может быть меньше минимального",
    path: ["budgetMax"],
});