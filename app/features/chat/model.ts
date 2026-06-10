export interface ChatContact {
    id: string;
    userId?: string;
    type: 'private' | 'group';
    avatar: string | null;
    displayName: string;
    login: string;
    lastMessage: string;
    lastMessageTime: string;
    badge?: string;
    lastOnline?: Date;
    unreadCount?: number;
    position?: {
        name: string;
        color: string;
    };
}

export interface ChatMessage {
    id: string;
    text: string;
    direction: "in" | "out";
    attachments?: ChatAttachment[];
    status?: "sending" | "sent" | "read";
    isEdited?: boolean;
    sentAt?: string;
    editedAt?: string;
    sender?: {
        id: string;
        name: string;
        avatar?: string | null;
    };
}

export interface ChatAttachment {
    id?: string;
    url: string;
    fileName: string;
    size: number;
    type: string;
}

export interface ChatData {
    contacts: ChatContact[];
    activeContactId: string;
    messages: ChatMessage[];
}