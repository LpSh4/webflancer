import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";

@Entity("refresh-token")
export class RefreshToken extends BaseEntity {
  @Column({ type: "varchar" })
  token!: string;

  @Column({ type: "timestamp" })
  expiresAt!: Date;

  @Column({ type: "varchar", nullable: true })
  userAgent?: string | null;

  @Column({ type: "varchar", nullable: true })
  ipAddress?: string | null;

  @Column({ name: "user_id" })
  userId!: string;

  @ManyToOne(() => User, (user) => user.refreshToken)
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;
}
