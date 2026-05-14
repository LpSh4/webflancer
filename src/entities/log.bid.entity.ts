import { ChildEntity, Column, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { Log } from "./log.base.entity";
import { Bid } from "./bid.entity";

@ChildEntity()
export class BidLog extends Log {
  @Column({ name: "bid_id" })
  bidId!: string;

  @ManyToOne(() => Bid, (bid) => bid.logs)
  @JoinColumn({ name: "bid_id" })
  bid!: Relation<Bid>;
}
