import { ChildEntity, Column, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { Role, User } from "./user.entity";
import { CommissionType } from "./commission.entity.type";

@ChildEntity(Role.MODERATOR)
export class Moderator extends User {
  @Column({ type: "varchar" })
  accessLevel?: string;

  @OneToMany(() => CommissionType, (commissionType) => commissionType.moderator)
  createdCommissionTypes?: Relation<CommissionType[]>;
}
