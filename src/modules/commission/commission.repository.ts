import { EntityManager } from "typeorm";
import { Commission, CommissionType } from "../../entities/commission.entity";
import { CommissionProgress } from "../../entities/commission.enums";
import { UserRepository } from "../user/user.repository";
import {
  NotFoundError,
  RequestError,
  UnauthorizedError,
} from "../../errors/errors";
import { CreateCommissionData, EditCommissionData } from "./commission.types";
import { Role } from "../../entities/user.entity";

export class CommissionRepository {
  constructor(
    private em: EntityManager,
    private userRepo: UserRepository,
  ) {}

  async createCommission(
    data: CreateCommissionData,
    em?: EntityManager,
  ): Promise<Commission> {
    const manager = em ?? this.em;
    const user = await this.userRepo.findById(data.clientId, em);

    if (!user) throw new NotFoundError("User not found");

    const commissionEntry = {
      clientId: data.clientId,
      commissionType: data.type ?? CommissionType.LANDING_PAGE,
      commissionProgress: CommissionProgress.POSTED,
      title: data.title ?? "Website commission",
      description: data.description ?? "",
      functionality: data.functionality ?? "",
      designLink: data.designLink ?? "",
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax ?? null,
      references: data.references?.slice(0, 20) ?? [],
    };

    const newCommission = manager.create(Commission, commissionEntry);
    return manager.save(newCommission);
  }

  async editCommission(
    data: EditCommissionData,
    em?: EntityManager,
  ): Promise<Commission> {
    const manager = em ?? this.em;
    const commissionEntry = await manager.findOne(Commission, {
      where: { id: data.id },
    });

    if (!commissionEntry) throw new NotFoundError("Commission not found");
    if (commissionEntry.clientId !== data.userId) throw new UnauthorizedError();

    console.log(data);
    const commission = {
      commissionType: data.type ?? commissionEntry.commissionType,
      title: data.title
        ? data.title.length > 5
          ? data.title
          : commissionEntry.title
        : commissionEntry.title,
      description: data.description
        ? data.description.length > 1
          ? data.description
          : commissionEntry.description
        : commissionEntry.description,
      functionality: data.functionality ?? commissionEntry.functionality,
      designLink: data.designLink ?? commissionEntry.designLink,
      budgetMin: data.budgetMin ?? commissionEntry.budgetMin,
      budgetMax: data.budgetMax ?? commissionEntry.budgetMax,
      deadline: data.deadLine ?? commissionEntry.deadline,
      references: data.references ?? commissionEntry.references,
    };

    Object.assign(commissionEntry, commission);
    return manager.save(commissionEntry);
  }

  async toggleArchive(
    id: string,
    userId: string,
    em?: EntityManager,
  ): Promise<Commission> {
    const manager = em ?? this.em;
    const user = await this.userRepo.findById(userId);

    if (!user) throw new NotFoundError("User not found");

    const commission = await manager.findOne(Commission, { where: { id: id } });

    if (!commission) throw new NotFoundError("Commission not found");

    if (commission.clientId !== user.id) throw new UnauthorizedError();

    commission.commissionProgress =
      commission.commissionProgress === CommissionProgress.ARCHIVED
        ? CommissionProgress.POSTED
        : CommissionProgress.ARCHIVED;

    return manager.save(commission);
  }

  async findByUserId(userId: string, em: EntityManager): Promise<Commission[]> {
    const manager = em ?? this.em;

    const user = await this.userRepo.findById(userId);

    if (!user) throw new NotFoundError("User not found");

    switch (user.role) {
      case Role.CLIENT:
        return manager.find(Commission, { where: { clientId: userId } });
      case Role.DEVELOPER:
        console.log(user);
        return manager.find(Commission, { where: { developerId: userId } });
      default:
        throw new RequestError("This user cant have commissions");
    }
  }

  async checkAccessibility(
    targetId: string,
    em?: EntityManager,
  ): Promise<Boolean> {
    const manager = em ?? this.em;

    const commission = await this.findById(targetId, manager);
    return !(
      commission.commissionProgress in
      [
        CommissionProgress.ARCHIVED,
        CommissionProgress.CANCELLED,
        CommissionProgress.DISPUTED,
        CommissionProgress.REFUNDED,
        CommissionProgress.COMPLETED,
      ]
    );
  }

  async findById(id: string, em?: EntityManager): Promise<Commission> {
    const manager = em ?? this.em;

    const commission = await manager.findOne(Commission, { where: { id: id } });

    if (!commission) throw new NotFoundError("Commission not found");

    return commission;
  }

  async getProgresses(): Promise<CommissionProgress[]> {
    return Object.values(CommissionProgress) as CommissionProgress[];
  }

  async getTypes(): Promise<CommissionType[]> {
    return Object.values(CommissionType) as CommissionType[];
  }
}
