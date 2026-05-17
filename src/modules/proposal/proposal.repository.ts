import { EntityManager, UpdateResult } from "typeorm";
import { CommissionRepository } from "../commission/commission.repository";
import { UserRepository } from "../user/user.repository";
import {
  NotFoundError,
  RequestError,
  UnauthorizedError,
} from "../../errors/errors";
import {
  CommissionWorkStatus,
  ProposalStatus,
} from "../../entities/commission.enums";
import { CommissionProposal } from "../../entities/commission.entity.proposals";

export class ProposalRepository {
  constructor(
    private commissionRepo: CommissionRepository,
    private userRepo: UserRepository,
    private em: EntityManager,
  ) {}

  async createProposal(
    targetId: string,
    userId: string,
    workStatus: CommissionWorkStatus,
    em?: EntityManager,
  ): Promise<CommissionProposal> {
    const manager = em ?? this.em;

    const commission = await this.commissionRepo.findById(targetId, manager);
    if (!commission) throw new NotFoundError("Commission not found");
    if (await this.commissionRepo.checkAccessibility(targetId, manager))
      throw new RequestError("Not accessible for proposals");

    const user = await this.userRepo.findById(userId);
    if (!user) throw new RequestError("User not found");
    if (userId !== commission.developerId) throw new UnauthorizedError();

    const proposal = manager.create(CommissionProposal, {
      status: ProposalStatus.PENDING,
      proposedStatus: workStatus,
      commissionId: targetId,
    });

    return manager.save(proposal);
  }

  async changeStatus(
    targetId: string,
    userId: string,
    status: ProposalStatus,
    em?: EntityManager,
  ): Promise<CommissionProposal> {
    const manager = em ?? this.em;

    const user = await this.userRepo.findById(userId);
    if (!user) throw new RequestError("User not found");

    const proposal = await this.findById(targetId, undefined, manager);
    const commission = await this.commissionRepo.findById(
      proposal.commissionId,
    );
    if (user.id !== commission.clientId) throw new UnauthorizedError();

    proposal.status = status;

    return manager.save(proposal);
  }

  async acceptAll(
    targetId: string,
    userId: string,
    em?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = em ?? this.em;

    const commission = await this.commissionRepo.findById(targetId);
    if (!commission) throw new NotFoundError("Commission not found");
    if (commission.clientId !== userId) throw new UnauthorizedError();

    return manager.update(
      CommissionProposal,
      {
        commissionId: targetId,
        status: ProposalStatus.PENDING,
      },
      { status: ProposalStatus.ACCEPTED },
    );
  }

  async findById(
    targetId: string,
    userId?: string,
    em?: EntityManager,
  ): Promise<CommissionProposal> {
    const manager = em ?? this.em;

    const proposal = await manager.findOne(CommissionProposal, {
      where: { id: targetId },
    });
    if (!proposal) throw new NotFoundError("Proposal not found");

    const commission = await this.commissionRepo.findById(
      proposal.commissionId,
      manager,
    );
    if (!commission) throw new NotFoundError("Commission not found");
    if (
      userId &&
      (userId !== commission.clientId || userId !== commission.developerId)
    )
      throw new UnauthorizedError();

    return proposal;
  }

  async findByCommissionId(
    targetId: string,
    userId?: string,
    em?: EntityManager,
  ): Promise<CommissionProposal[]> {
    const manager = em ?? this.em;

    const commission = await this.commissionRepo.findById(targetId, manager);
    if (!commission) throw new NotFoundError("Commission not found");
    if (
      userId &&
      (userId !== commission.clientId || userId !== commission.developerId)
    )
      throw new UnauthorizedError();
    return manager.find(CommissionProposal, {
      where: { commissionId: targetId },
    });
  }
}
