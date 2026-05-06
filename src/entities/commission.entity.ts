import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Client } from "./user.entity.client";
import { Developer } from "./user.entity.developer";
import { CommissionType } from "./commission.entity.type";
import { CommissionProgress } from "./commission.entity.progress";
import { Bid } from "./bid.entity";
import { CommissionLog } from "./commission.entity.log";

@Entity()
export class Commission extends BaseEntity {
  @Column({ type: "varchar", name: "client_id" })
  clientId!: string;

  @ManyToOne(() => Client, (client) => client.commissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "client_id",
  })
  client!: Relation<Client>;

  @Column({ type: "varchar", name: "developer_id" })
  developerId?: string;

  @ManyToOne(() => Developer, (developer) => developer.orders, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "developer_id",
  })
  developer?: Relation<Developer>;

  @Column({ type: "varchar", name: "commission_type" })
  type!: string;

  @ManyToOne(
    () => CommissionType,
    (commissionType) => commissionType.commissions,
  )
  @JoinColumn({
    name: "commission_type",
  })
  commissionType!: Relation<CommissionType>;

  @Column({ type: "varchar", name: "commission_progress" })
  progress!: string;

  @ManyToOne(
    () => CommissionProgress,
    (commissionProgress) => commissionProgress.commissions,
  )
  @JoinColumn({
    name: "commission_progress",
  })
  commissionProgress!: Relation<CommissionProgress>;

  @Column({ type: "varchar", default: "Website commission" })
  title!: string;

  @Column({ type: "varchar", default: "" })
  description!: string;

  @Column({ type: "varchar", default: "" })
  functionality?: string;

  @Column({ type: "varchar", default: "" })
  designLink?: string;

  @Column({ type: "int", default: 0 })
  budgetMin!: number;

  @Column({ type: "int", default: 0 })
  budgetMax?: number;

  @Column({ type: "timestamp", nullable: true, default: null })
  deadline?: Date | null;

  @Column("text", { array: true })
  references?: string[];

  @OneToMany(() => Bid, (bid) => bid.commission, { onDelete: "CASCADE" })
  bids?: Relation<Bid[]>;

  @OneToMany(() => CommissionLog, (commissionLog) => commissionLog.commission, {
    onDelete: "CASCADE",
  })
  logs?: Relation<CommissionLog>;
}
