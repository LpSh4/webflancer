import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Commission } from "./commission.entity";
import { Developer } from "./user.entity.developer";

export enum BidStatus {
  CREATED = "created",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn",
}

@Entity("bids")
export class Bid extends BaseEntity {
  @Column({ type: "enum", enum: BidStatus, default: BidStatus.CREATED })
  bidStatus!: BidStatus;

  @Column({ type: "varchar", name: "commission_id" })
  commissionId!: string;

  @ManyToOne(() => Commission, (commission) => commission.bids)
  @JoinColumn({ name: "commission_id" })
  commission!: Relation<Commission>;

  @Column({ type: "varchar", name: "developer_id" })
  developerId!: string;

  @ManyToOne(() => Developer, (developer) => developer.bids)
  @JoinColumn({ name: "developer_id" })
  developer!: Relation<Developer>;
}
