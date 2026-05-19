import { z } from "zod";

export const createPrivateChatSchema = z.object({
    participantId: z.string().uuid("ID должен быть UUID"),
});

export const updateTitleSchema = z.object({
    title: z.string().min(1, "Введите название").max(100, "Название до 100 символов"),
});

export const addParticipantSchema = z.object({
    userId: z.string().uuid("ID должен быть UUID"),
});

export const chatAndUserParam = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
});

export type CreatePrivateChatBody = z.infer<typeof createPrivateChatSchema>;
export type UpdateTitleBody = z.infer<typeof updateTitleSchema>;
export type AddParticipantBody = z.infer<typeof addParticipantSchema>;

// pagination
export const chatMessagesQuery = z.object({
    page: z.coerce.number().min(1).default(1),
});
export type ChatMessagesQuery = z.infer<typeof chatMessagesQuery>;