import { Role, User } from "./user.entity";
import { ChildEntity, Column, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { Commission } from "./commission.entity";
import { Review } from "./review.entity";

@ChildEntity(Role.CLIENT)
export class Client extends User {
  @Column({ type: "varchar" })
  companyName?: string;

  @Column({ type: "varchar" })
  companyLink?: string;

  @Column({ type: "int" })
  totalExpense?: number;

  @OneToMany(() => Commission, (commission) => commission.client)
  commissions?: Relation<Commission[]>;

  @OneToMany(() => Review, (review) => review.client, {
    onDelete: "CASCADE",
  })
  reviews?: Relation<Review[]>;
}
