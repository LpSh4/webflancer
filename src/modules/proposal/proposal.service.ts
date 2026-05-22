import { EntityManager, UpdateResult } from "typeorm";
import { ProposalRepository } from "./proposal.repository";
import { CommissionProposal } from "../../entities/commission.entity.proposals";
import {
  CommissionWorkStatus,
  ProposalStatus,
} from "../../entities/commission.enums";

export class ProposalService {
  constructor(
    private em: EntityManager,
    private proposalRepo: ProposalRepository,
  ) {}

  async createProposal(
    targetId: string,
    userId: string,
    workStatus: CommissionWorkStatus,
    em?: EntityManager,
  ): Promise<CommissionProposal> {
    const manager = em ?? this.em;

    return manager.transaction(async (trxEm): Promise<CommissionProposal> => {
      return this.proposalRepo.createProposal(
        targetId,
        userId,
        workStatus,
        trxEm,
      );
    });
  }

  async changeStatus(
    targetId: string,
    status: ProposalStatus,
    userId: string,
    em?: EntityManager,
  ): Promise<CommissionProposal> {
    const manager = em ?? this.em;

    return manager.transaction(async (trxEm): Promise<CommissionProposal> => {
      return this.proposalRepo.changeStatus(targetId, userId, status, trxEm);
    });
  }

  async acceptAll(
    targetId: string,
    userId: string,
    em?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = em ?? this.em;

    return manager.transaction(async (trxEm): Promise<UpdateResult> => {
      return this.proposalRepo.acceptAll(targetId, userId, trxEm);
    });
  }

  async findById(
    targetId: string,
    userId: string,
  ): Promise<CommissionProposal> {
    return this.proposalRepo.findById(targetId, userId);
  }

  async findByCommissionId(
    targetId: string,
    userId: string,
  ): Promise<CommissionProposal[]> {
    return this.proposalRepo.findByCommissionId(targetId, userId);
  }
}
