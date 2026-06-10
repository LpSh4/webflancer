import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Chat } from "./chat.entity";
import { User } from "./user.entity";

@Entity("messages")
export class Message extends BaseEntity {
    @Column({ type: "uuid", name: "chat_id" })
    chatId!: string;

    @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: "CASCADE" })
    @JoinColumn({ name: "chat_id" })
    chat!: Chat;

    // Кто написал (null, если это написала Система)
    @Column({ type: "uuid", name: "sender_id", nullable: true })
    senderId?: string | null;

    @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "sender_id" })
    sender?: User | null;

    @Column({ type: "text" })
    content!: string;

    @Column({ type: "boolean", name: "is_system", default: false })
    isSystem!: boolean;
}