import { CommissionRepository } from "./commission.repository";
import { Commission, CommissionType } from "../../entities/commission.entity";
import { EntityManager } from "typeorm";
import { CreateCommissionData, EditCommissionData } from "./commission.types";
import { CommissionProgress } from "../../entities/commission.enums";

export class CommissionService {
  constructor(
    private em: EntityManager,
    private commissionRepo: CommissionRepository,
  ) {}

  async createCommission(data: CreateCommissionData): Promise<Commission> {
    return this.em.transaction(async (trxEm): Promise<Commission> => {
      return await this.commissionRepo.createCommission(data, trxEm);
    });
  }

  async getCommission(id: string, em?: EntityManager): Promise<Commission> {
    return await this.commissionRepo.findById(id, em);
  }

  async editCommission(data: EditCommissionData): Promise<Commission> {
    return this.em.transaction(async (trxEm): Promise<Commission> => {
      return await this.commissionRepo.editCommission(data, trxEm);
    });
  }

  async toggleArchivedCommission(
    id: string,
    userId: string,
    em?: EntityManager,
  ): Promise<Commission> {
    const manager = em ?? this.em;

    return manager.transaction(async (trxEm): Promise<Commission> => {
      return await this.commissionRepo.toggleArchive(id, userId, trxEm);
    });
  }

  async getUserCommissions(
    id: string,
    em?: EntityManager,
  ): Promise<Commission[]> {
    const manager = em ?? this.em;
    return manager.transaction(async (trxEm): Promise<Commission[]> => {
      return await this.commissionRepo.findByUserId(id, trxEm);
    });
  }

  async getTypes(): Promise<CommissionType[]> {
    return this.commissionRepo.getTypes();
  }

  async getProgresses(): Promise<CommissionProgress[]> {
    return this.commissionRepo.getProgresses();
  }
}
