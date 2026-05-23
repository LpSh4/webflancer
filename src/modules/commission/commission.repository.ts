import { Brackets, EntityManager, UpdateResult } from "typeorm";
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
import {
  CommissionSearchQuery,
  CommissionSearchResponse,
} from "./schemas/commission.schema";

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

  async searchCommissions(
    query: CommissionSearchQuery,
    em: EntityManager,
  ): Promise<CommissionSearchResponse> {
    const manager = em ?? this.em;
    const limit = query.limit || 20;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const qb = manager
      .getRepository(Commission)
      .createQueryBuilder("commission");

    if (query.keywords) {
      const words = query.keywords.split(/\s+/).filter(Boolean);
      qb.andWhere(
        new Brackets((sub) => {
          words.forEach((word, i) => {
            const p = `%${word}%`;
            sub
              .orWhere(`commission.title ILIKE :w${i}`, { [`w${i}`]: p })
              .orWhere(`commission.description ILIKE :w${i}`, { [`w${i}`]: p });
          });
        }),
      );
    }
    qb.andWhere("commission.commissionProgress = :progress", {
      progress: CommissionProgress.POSTED,
    });
    if (query.commissionType) {
      qb.andWhere("commission.commissionType = :type", {
        type: query.commissionType,
      });
    }
    if (query.budgetFrom) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where("commission.budgetMax >= :bFrom")
            .orWhere("commission.budgetMin >= :bFrom");
        }),
        { bFrom: query.budgetFrom },
      );
    }
    if (query.budgetTo) {
      qb.andWhere("commission.budgetMin <= :bTo", { bTo: query.budgetTo });
    }
    const orderMap: Record<
      Required<CommissionSearchQuery>["sortBy"],
      { col: string; dir: "ASC" | "DESC" }
    > = {
      high_budget: { col: "commission.budgetMin", dir: "DESC" },
      low_budget: { col: "commission.budgetMin", dir: "ASC" },
      fresh: { col: "commission.createdAt", dir: "DESC" },
      soonest: { col: "commission.deadline", dir: "ASC" },
    };

    const sort = orderMap[query.sortBy || "fresh"];
    if (query.sortBy === "soonest") {
      qb.orderBy("commission.deadline", "ASC", "NULLS LAST");
    } else {
      qb.orderBy(sort.col, sort.dir);
    }
    const [results, total] = await qb.take(limit).skip(skip).getManyAndCount();

    return {
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit) || 0,
      },
      data: results,
    };
  }

  async completeCommission(
    id: string,
    userId: string,
    em?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = em ?? this.em;
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    const commission = await this.findById(id);
    if (!commission) throw new NotFoundError("Commission not found");
    if (commission.clientId !== user.id) throw new UnauthorizedError();

    console.log(commission.commissionProgress);
    console.log(CommissionProgress.DEVELOPMENT_COMPLETE);

    if (
      [
        CommissionProgress.DEVELOPMENT,
        CommissionProgress.TESTING,
        CommissionProgress.DEVELOPMENT_COMPLETE,
        CommissionProgress.DISPUTED,
      ].includes(commission.commissionProgress)
    ) {
      return this.changeProgress(id, CommissionProgress.COMPLETED, manager);
    }
    throw new RequestError("Bad progress");
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
        CommissionProgress.DEVELOPMENT_COMPLETE,
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

  async changeProgress(
    targetId: string,
    progress: CommissionProgress,
    em?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = em ?? this.em;
    const commission = await this.findById(targetId, manager);
    if (!commission) throw new NotFoundError("Commission not found");
    return manager.update(Commission, targetId, {
      commissionProgress: progress,
    });
  }

  async changeDeveloper(
    targetId: string,
    developerId: string | null,
    em?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = em ?? this.em;
    const commission = await this.findById(targetId, manager);
    if (!commission) throw new NotFoundError("Commission not found");
    return manager.update(Commission, targetId, {
      developerId: developerId,
    });
  }

  async getProgresses(): Promise<CommissionProgress[]> {
    return Object.values(CommissionProgress) as CommissionProgress[];
  }

  async getTypes(): Promise<CommissionType[]> {
    return Object.values(CommissionType) as CommissionType[];
  }
}
