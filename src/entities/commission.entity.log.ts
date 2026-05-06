import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Commission } from "./commission.entity";

@Entity()
export class CommissionLog extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  title!: string;

  @Column({ type: "varchar", nullable: true })
  content?: string | null;

  @ManyToOne(() => Commission, (commission) => commission.logs)
  @JoinColumn({ name: "commissionId" })
  commission!: Relation<Commission>;
}
