import { BidRepository } from "./bid.repository";
import { EntityManager, UpdateResult } from "typeorm";
import { CreateBidData } from "./bid.types";
import { Bid } from "../../entities/bid.entity";

export class BidService {
  constructor(
    private bidRepo: BidRepository,
    private em: EntityManager,
  ) {}

  async createBid(data: CreateBidData, em?: EntityManager): Promise<Bid> {
    const manager = em ?? this.em;
    return manager.transaction(async (trxEm): Promise<Bid> => {
      return await this.bidRepo.CreateBid(data, trxEm);
    });
  }

  async acceptBid(
    targetId: string,
    userId: string,
    em?: EntityManager,
  ): Promise<Bid> {
    const manager = em ?? this.em;
    return manager.transaction(async (trxEm): Promise<Bid> => {
      return await this.bidRepo.acceptBid(targetId, userId, trxEm);
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
