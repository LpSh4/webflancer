import { z } from "zod";

export const uuidParam = z.object({
    id: z.string().uuid("Некорректный ID (должен быть UUID)"),
});

export const assignmentParam = z.object({
    assignmentId: z.string().uuid("Некорректный ID назначения"),
});

export const paginationQuery = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    sort: z.string().optional()
});