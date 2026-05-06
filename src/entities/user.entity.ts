import { Column, Entity, OneToMany, TableInheritance } from "typeorm";
import type { Relation } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserLog } from "./user.entity.log";
import { RefreshToken } from "./refresh-token.entity";

export enum Role {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  CLIENT = "CLIENT",
  DEVELOPER = "DEVELOPER",
}

@Entity("user")
@TableInheritance({ column: { type: "varchar", name: "role" } })
export class User extends BaseEntity {
  @Column({ type: "varchar" })
  role!: Role;

  @Column({ type: "varchar", unique: true })
  login!: string;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "boolean", default: false })
  verifiedEmail!: boolean;

  @Column({ type: "varchar" })
  phoneNumber!: string;

  @Column({ type: "varchar" })
  password!: string;

  @Column({ type: "varchar" })
  displayedName!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  surname?: string | null;

  @Column({ type: "varchar" })
  profilePicture?: string;

  @Column({ type: "varchar", default: "" })
  profileStatus?: string;

  @Column({ type: "timestamp", nullable: true, default: null })
  lastOnline?: Date | null;

  @Column({
    type: "decimal",
    precision: 3,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  averageRating?: number;

  @OneToMany(() => UserLog, (userLog) => userLog.userId, {
    onDelete: "CASCADE",
  })
  logs?: Relation<UserLog[]>;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.userId, {
    onDelete: "CASCADE",
  })
  refreshToken?: Relation<RefreshToken[]>;
}
