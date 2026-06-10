import {EntityManager, UpdateResult} from "typeorm";
import {ProposalRepository} from "./proposal.repository";
import {CommissionProposal} from "../../entities/commission.entity.proposals";
import {
    CommissionWorkStatus,
    ProposalStatus,
} from "../../entities/commission.enums";
import {NotificationService} from "../notification/notification.service";
import {CommissionService} from "../commission/commission.service";
import {NotificationType} from "../../entities/notification.entity";

export class ProposalService {
    constructor(
        private em: EntityManager,
        private proposalRepo: ProposalRepository,
        private notificationService: NotificationService,
        private commissionService: CommissionService,
    ) {
    }

    async createProposal(
        targetId: string,
        userId: string,
        workStatus: CommissionWorkStatus,
        em?: EntityManager,
    ): Promise<CommissionProposal> {
        const manager = em ?? this.em;

        return manager.transaction(async (trxEm): Promise<CommissionProposal> => {
            const proposal = await this.proposalRepo.createProposal(
                targetId,
                userId,
                workStatus,
                trxEm,
            );
            const commission = await this.commissionService.getCommission(targetId);

            await this.notificationService.createNotification(
                {
                    recipientId: commission.clientId,
                    title: "Разработчик обновил прогресс!",
                    message: `Прогресс заказа "${commission.title}" был обновлён.`,
                    type: NotificationType.PROPOSAL_UPDATE,
                },
                trxEm,
            );

            return proposal;
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
            const proposal = await this.proposalRepo.changeStatus(
                targetId,
                userId,
                status,
                trxEm,
            );

            // Получаем комиссию по ID из пропозала, не по targetId
            const commission = await this.commissionService.getCommission(
                proposal.commissionId, // <-- вот исправление
                trxEm,
            );

            if (commission.developerId) {
                await this.notificationService.createNotification(
                    {
                        recipientId: commission.developerId,
                        title: "Изменение статуса прогресса",
                        message: `Автор заказа "${commission.title}" изменил статус прогресса.`,
                        type: NotificationType.PROPOSAL_UPDATE,
                    },
                    trxEm,
                );
            }
            return proposal;
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
