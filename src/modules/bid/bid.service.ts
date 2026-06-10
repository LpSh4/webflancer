import {BidRepository} from "./bid.repository";
import {EntityManager, UpdateResult} from "typeorm";
import {CreateBidData} from "./bid.types";
import {Bid} from "../../entities/bid.entity";
import {NotificationService} from "../notification/notification.service";
import {CommissionRepository} from "../commission/commission.repository";
import {NotificationType} from "../../entities/notification.entity";

export class BidService {
    constructor(
        private bidRepo: BidRepository,
        private em: EntityManager,
        private notificationService: NotificationService,
        private commissionRepo: CommissionRepository,
    ) {
    }

    async createBid(data: CreateBidData, em?: EntityManager): Promise<Bid> {
        const manager = em ?? this.em;
        return manager.transaction(async (trxEm): Promise<Bid> => {
            const bid = await this.bidRepo.CreateBid(data, trxEm);
            const commission = await this.commissionRepo.findById(
                data.targetId,
                trxEm,
            );

            await this.notificationService.createNotification(
                {
                    recipientId: commission.clientId,
                    title: "Новый отклик 💰",
                    message: `Разработчик оставил отклик на заказ "${commission.title}".`,
                    type: NotificationType.BID_UPDATE,
                },
                trxEm,
            );

            return bid;
        });
    }

    async acceptBid(targetId: string, userId: string, em?: EntityManager): Promise<Bid> {
        const manager = em ?? this.em;
        return manager.transaction(async (trxEm): Promise<Bid> => {
            const bid = await this.bidRepo.acceptBid(targetId, userId, trxEm);
            const commission = await this.commissionRepo.findById(bid.commissionId, trxEm); // <-- исправлено

            if (commission.developerId) {
                await this.notificationService.createNotification({
                    recipientId: commission.developerId,
                    title: "Отклик принят",
                    message: `Ваш отклик на заказ "${commission.title}" был принят.`,
                    type: NotificationType.BID_UPDATE,
                }, trxEm);
            }
            return bid;
        });
    }

    async withdrawBid(
        targetId: string,
        userId: string,
        em?: EntityManager,
    ): Promise<UpdateResult> {
        const manager = em ?? this.em;
        return manager.transaction(async (trxEm): Promise<UpdateResult> => {
            return await this.bidRepo.withdrawBid(targetId, userId, trxEm);
        });
    }

    async getBidByCommissionId(
        commissionId: string,
        em?: EntityManager,
    ): Promise<Bid[]> {
        const manager = em ?? this.em;
        return manager.transaction(async (trxEm): Promise<Bid[]> => {
            return this.bidRepo.findByCommissionId(commissionId, trxEm);
        });
    }

    async getBidByUserId(userId: string, em?: EntityManager): Promise<Bid[]> {
        const manager = em ?? this.em;
        return manager.transaction(async (trxEm): Promise<Bid[]> => {
            return await this.bidRepo.findByUserId(userId, trxEm);
        });
    }

    async getBidById(id: string, em?: EntityManager): Promise<Bid> {
        return this.bidRepo.findById(id, em);
    }
}
