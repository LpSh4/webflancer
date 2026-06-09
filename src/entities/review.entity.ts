import { Check, Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import type { Relation } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Commission } from "./commission.entity";
import { Client } from "./user.entity.client";
import { Developer } from "./user.entity.developer";

// Add this helper transformer at the top of your entity file
const numericTransformer = {
  to: (value: number | null) => value,
  from: (value: string | null) => (value ? parseFloat(value) : null),
};

@Entity("review")
// Update the check constraint to ignore null values safely
@Check(
  `("clientRating" IS NULL OR ("clientRating" >= 0 AND "clientRating" <= 5)) AND ("developerRating" IS NULL OR ("developerRating" >= 0 AND "developerRating" <= 5))`,
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

  // Changed to nullable: true 👇
  @Column("varchar", { nullable: true, name: "client_id" })
  clientId?: string | null;

  @ManyToOne(() => Client, (client) => client.reviews, { onDelete: "CASCADE" })
  @JoinColumn({ name: "client_id" })
  client?: Relation<Client>;

  @Column("varchar", { length: 255, nullable: true })
  clientReview?: string | null;

  // Changed to nullable: true 👇
  @Column("varchar", { nullable: true, name: "developer_id" })
  developerId?: string | null;

  @ManyToOne(() => Developer, (developer) => developer.reviews, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "developer_id" })
  developer?: Relation<Developer>;

  @Column("varchar", { length: 255, nullable: true })
  developerReview?: string | null;

  // Then use it inside your Review Entity class:
  @Column("numeric", {
    precision: 2,
    scale: 1,
    nullable: true,
    default: null,
    transformer: numericTransformer, // 👈 Adds casting hook here
  })
  clientRating?: number | null;

  @Column("numeric", {
    precision: 2,
    scale: 1,
    nullable: true,
    default: null,
    transformer: numericTransformer, // 👈 And here
  })
  developerRating?: number | null;
}
