export interface AppNotification {
    id: string;
    type: 'task_assigned' | 'message' | 'comment' | 'deadline';
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    taskId?: string;
    stageId?: string;
    messageId?: string;
    chatId?: string;
}