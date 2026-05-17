import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { Commission } from "./commission.entity";
import { BaseEntity } from "./base.entity";
import { CommissionWorkStatus, ProposalStatus } from "./commission.enums";

@Entity()
export class CommissionProposal extends BaseEntity {
  @Column({
    type: "enum",
    enum: ProposalStatus,
    default: ProposalStatus.PENDING,
    enumName: "commissions_proposed_progress_status",
  })
  status!: ProposalStatus;

  @Column({
    type: "enum",
    enum: CommissionWorkStatus,
    default: CommissionWorkStatus.REQUIREMENTS_GATHERING,
    enumName: "commissions_work_status",
  })
  proposedStatus!: CommissionWorkStatus;

  @Column({ type: "uuid" })
  commissionId!: string;

  @ManyToOne(() => Commission, (commission) => commission.proposals)
  @JoinColumn({ name: "commission_id" })
  commission!: Commission;
}
