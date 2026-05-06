import { ChildEntity, Column, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { Role, User } from "./user.entity";
import { Commission } from "./commission.entity";
import { Bid } from "./bid.entity";

@ChildEntity(Role.DEVELOPER)
export class Developer extends User {
  @Column({ type: "varchar" })
  socialLinkedIn?: string;

  @Column({ type: "varchar" })
  socialX?: string;

  @Column({ type: "varchar" })
  socialGitHub?: string;

  @Column({ type: "varchar", array: true, default: [] })
  portfolioLinks?: string[];

  @Column({ type: "varchar", default: "" })
  bio!: string;

  @Column({ type: "int" })
  avgHourlyRate?: number;

  @OneToMany(() => Commission, (commission) => commission.developer)
  orders?: Relation<Commission[]>;

  @OneToMany(() => Bid, (bid) => bid.developer)
  bids?: Relation<Bid[]>;
}
