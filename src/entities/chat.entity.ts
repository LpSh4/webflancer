import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";
import { Commission } from "./commission.entity";
import { Message } from "./message.entity";

@Entity("chats")
export class Chat extends BaseEntity {
    // Привязка к заказу (чтобы понимать, по какому поводу общаются)
    @Column({ type: "uuid", name: "commission_id" })
    commissionId!: string;

    @ManyToOne(() => Commission, { onDelete: "CASCADE" })
    @JoinColumn({ name: "commission_id" })
    commission!: Commission;

    // Участник 1 (Заказчик)
    @Column({ type: "uuid", name: "client_id" })
    clientId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "client_id" })
    client!: User;

    // Участник 2 (Разработчик)
    @Column({ type: "uuid", name: "developer_id" })
    developerId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "developer_id" })
    developer!: User;

    @OneToMany(() => Message, (message) => message.chat)
    messages!: Message[];
}