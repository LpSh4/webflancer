import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";

export enum LogType {
  SYSTEM = "SYSTEM",
  MANUAL = "MANUAL",
}

@Entity()
export class UserLog extends BaseEntity {
  @Column({ type: "enum", enum: LogType, default: LogType.MANUAL })
  logType!: LogType;

  @Column({ type: "varchar", nullable: false })
  title!: string;

  @Column({ type: "varchar", nullable: true })
  content?: string | null;

  @ManyToOne(() => User, (user) => user.logs)
  @JoinColumn({ name: "user_id" })
  userId!: Relation<User>;
}
