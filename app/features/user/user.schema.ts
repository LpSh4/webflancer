import {z} from "zod";
import {paginationQuery} from "~/shared/zod/shared.schema";

export const userParamSchema = z.object({
    id: z.string().uuid("Некорректный ID (должен быть UUID)").or(z.literal("me"))
});

export const searchQuerySchema = z.object({
    q: z.string().max(100, "Слишком длинный поисковый запрос").default(""),
});

export const assignMentorSchema = z.object({
    internId: z.string().uuid("Некорректный ID стажера"),
    mentorId: z.string().uuid("Некорректный ID наставника").nullable(),
});

export const assignProgramSchema = z.object({
    internId: z.string().uuid("Некорректный ID стажера"),
    programId: z.string().uuid("Некорректный ID программы"),
});

export const updateProfileSchema = z.object({
    role: z.enum(["intern", "teamlead", "hr"] as const).optional(),
    login: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/).optional(),
    email: z.string().email().max(255).optional().or(z.literal("")),
    displayName: z.string().max(100).optional().or(z.literal("")),
    positionId: z.string().uuid().optional().or(z.literal("")),
    mentorId: z.string().uuid().optional().or(z.literal("")),
    avatar: z.string().max(1024).optional().or(z.literal("")),
});

export const lastOnlineSchema = z.object({
    lastOnline: z.string().datetime("Ожидается дата в формате ISO"),
});

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1).max(128),
    newPassword: z.string().min(6).max(128),
});

export const statsQuerySchema = z.object({
    month: z.string().regex(/^(0?[1-9]|1[012])$/, "1-12").optional(),
    year: z.string().regex(/^20\d{2}$/, "20xx").optional(),
});

export const teamListQuerySchema = paginationQuery.extend({
    role: z.string().max(50).optional(),
});

export const emailQuerySchema = z.object({email: z.string().email().max(255)});
export const loginQuerySchema = z.object({login: z.string().max(50)});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type AssignMentorBody = z.infer<typeof assignMentorSchema>;
export type AssignProgramBody = z.infer<typeof assignProgramSchema>;
export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
export type LastOnlineBody = z.infer<typeof lastOnlineSchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>;
export type StatsQuery = z.infer<typeof statsQuerySchema>;
export type TeamListQuery = z.infer<typeof teamListQuerySchema>;
export type EmailQuery = z.infer<typeof emailQuerySchema>;
export type LoginQuery = z.infer<typeof loginQuerySchema>;