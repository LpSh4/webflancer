import { Check, Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import type { Relation } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Commission } from "./commission.entity";
import { Client } from "./user.entity.client";
import { Developer } from "./user.entity.developer";

@Entity("review")
@Check(
  `"clientRating" >= 0 AND "clientRating" <= 5 AND "developerRating" >= 0 AND "developerRating" <= 5`,
)
@Unique(["clientId", "commissionId"])
@Unique(["developerId", "commissionId"])
export class Review extends BaseEntity {
  @Column("varchar", { nullable: false, name: "commission_id" })
  commissionId!: string;

  @ManyToOne(() => Commission, (commission) => commission.reviews, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "commission_id" })
  commission!: Relation<Commission>;

  @Column("varchar", { nullable: false, name: "client_id" })
  clientId?: string;

  @ManyToOne(() => Client, (client) => client.reviews, { onDelete: "CASCADE" })
  @JoinColumn({ name: "client_id" })
  client?: Relation<Client>;

  @Column("varchar", { length: 255, nullable: true })
  clientReview?: string | null;

  @Column("numeric", { precision: 2, scale: 1, default: 5, nullable: false })
  clientRating?: number;

  @Column("varchar", { nullable: false, name: "developer_id" })
  developerId?: string;

  @ManyToOne(() => Developer, (developer) => developer.reviews, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "developer_id" })
  developer?: Relation<Developer>;

  @Column("varchar", { length: 255, nullable: true })
  developerReview?: string | null;

  @Column("numeric", { precision: 2, scale: 1, default: 5, nullable: false })
  developerRating?: number;
}
