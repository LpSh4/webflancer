import { BaseEntity } from "./base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { Moderator } from "./user.entity.moderator";
import { Commission } from "./commission.entity";

@Entity()
export class CommissionProgress extends BaseEntity {
  @Column({ type: "varchar", unique: true })
  name!: string;

  @Column({ type: "varchar", default: "WIP type" })
  title!: string;

  @Column({ type: "int", name: "moderator_id" })
  moderatorId!: number;

  @ManyToOne(() => Moderator, (moderator) => moderator.createdCommissionTypes)
  @JoinColumn({ name: "moderator_id" })
  moderator!: Relation<Moderator>;

  @OneToMany(() => Commission, (commission) => commission.commissionProgress, {
    onDelete: "RESTRICT",
  })
  commissions?: Relation<Commission[]>;
}
