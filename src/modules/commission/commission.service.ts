import { CommissionRepository } from "./commission.repository";
import { Commission, CommissionType } from "../../entities/commission.entity";
import { EntityManager, UpdateResult } from "typeorm";
import { CreateCommissionData, EditCommissionData } from "./commission.types";
import { CommissionProgress } from "../../entities/commission.enums";
import {
  CommissionSearchQuery,
  CommissionSearchResponse,
} from "./schemas/commission.schema";
import { NotificationType } from "../../entities/notification.entity";
import { NotificationService } from "../notification/notification.service";

export class CommissionService {
  constructor(
    private em: EntityManager,
    private commissionRepo: CommissionRepository,
    private notificationService: NotificationService,
  ) {}

  async createCommission(data: CreateCommissionData): Promise<Commission> {
    return this.em.transaction(async (trxEm): Promise<Commission> => {
      const commission = await this.commissionRepo.createCommission(
        data,
        trxEm,
      );

      await this.notificationService.createNotification(
        {
          recipientId: commission.clientId,
          title: "Заказ создан 🎉",
          message: `Заказ "${commission.title}" успешно создан! Следите за откликами!`,
          type: NotificationType.COMMISSION_UPDATE,
        },
        trxEm,
      );

      return commission;
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

  async searchCommissions(
    data: CommissionSearchQuery,
  ): Promise<CommissionSearchResponse> {
    return this.em.transaction(
      async (trxEm): Promise<CommissionSearchResponse> => {
        return await this.commissionRepo.searchCommissions(data, trxEm);
      },
    );
  }

  async completeCommission(id: string, userId: string): Promise<UpdateResult> {
    return this.em.transaction(async (trxEm): Promise<UpdateResult> => {
      const result = await this.commissionRepo.completeCommission(
        id,
        userId,
        trxEm,
      );
      const commission = await this.commissionRepo.findById(id, trxEm);

      await this.notificationService.createNotification(
        {
          recipientId: commission.clientId,
          title: "Заказ выполнен 🎉",
          message: `Статус заказа "${commission.title}" был изменён на "Выполнен"!`,
          type: NotificationType.COMMISSION_UPDATE,
        },
        trxEm,
      );

      if (commission.developerId) {
        await this.notificationService.createNotification(
          {
            recipientId: commission.developerId,
            title: "Заказ выполнен 🎉",
            message: `Автор заказа "${commission.title}" изменил статус на "Выполнен". Хорошая работа!`,
            type: NotificationType.COMMISSION_UPDATE,
          },
          trxEm,
        );
      }

      return result;
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
