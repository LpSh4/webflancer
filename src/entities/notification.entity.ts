import { Column, Entity, JoinColumn, ManyToOne, Index } from "typeorm";
import type { Relation } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";

export enum NotificationType {
  REVIEW_UPDATE = "REVIEW_UPDATE",
  COMMISSION_UPDATE = "COMMISSION_UPDATE",
  BID_UPDATE = "BID_UPDATE",
  PROPOSAL_UPDATE = "PROPOSAL_UPDATE",
  SYSTEM = "SYSTEM",
}

@Entity("notification")
export class Notification extends BaseEntity {
  @Index()
  @Column("varchar", { nullable: false, name: "recipient_id" })
  recipientId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "recipient_id" })
  recipient!: Relation<User>;

  @Column("varchar", { length: 100, nullable: false })
  title!: string;

  @Column("varchar", { length: 255, nullable: false })
  message!: string;

  @Column("enum", { enum: NotificationType, nullable: false })
  type!: NotificationType;

  @Column("varchar", { length: 255, nullable: true, name: "action_url" })
  actionUrl?: string | null; // e.g., "/commissions/d9ec7f9d..."

  @Column("boolean", { default: false, name: "is_read" })
  isRead!: boolean;
}
