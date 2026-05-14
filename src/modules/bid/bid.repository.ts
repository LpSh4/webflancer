import { CommissionRepository } from "../commission/commission.repository";
import { UserRepository } from "../user/user.repository";
import { EntityManager, Not, UpdateResult } from "typeorm";
import { Bid, BidStatus } from "../../entities/bid.entity";
import { CreateBidData } from "./bid.types";
import {
  ConflictError,
  NotFoundError,
  RequestError,
  UnauthorizedError,
} from "../../errors/errors";
import { Role } from "../../entities/user.entity";

export class BidRepository {
  constructor(
    private commissionRepo: CommissionRepository,
    private userRepo: UserRepository,
    private em: EntityManager,
  ) {}

  async CreateBid(data: CreateBidData, em?: EntityManager): Promise<Bid> {
    const manager = em ?? this.em;

    const user = await this.userRepo.findById(data.devId, manager);

    if (!user) throw new NotFoundError("User Not Found");
    if (user.role === Role.CLIENT)
      throw new UnauthorizedError("Clients cant bid for commissions");
    if (!(await this.commissionRepo.findById(data.targetId, manager)))
      throw new NotFoundError("Commission Not Found");
    if (
      await manager.findOne(Bid, {
        where: { commissionId: data.targetId, developerId: data.devId },
      })
    )
      throw new ConflictError("Bid already exists");

    const bid = manager.create(Bid, {
      bidStatus: BidStatus.CREATED,
      commissionId: data.targetId,
      developerId: data.devId,
    });

    return manager.save(Bid, bid);
  }

  async acceptBid(
    id: string,
    userId: string,
    em?: EntityManager,
  ): Promise<Bid> {
    const manager = em ?? this.em;
    const bid = await this.findById(id, manager);
    if (!bid) throw new NotFoundError("Bid not found");
    if (bid.bidStatus !== BidStatus.CREATED) {
      throw new RequestError("Bid isn't active");
    }

    const commission = await this.commissionRepo.findById(
      bid.commissionId,
      manager,
    );
    if (!commission) throw new NotFoundError("Commission not found");
    if (commission.clientId !== userId) throw new UnauthorizedError();

    bid.bidStatus = BidStatus.ACCEPTED;
    const savedBid = await manager.save(bid);

    await manager.update(
      Bid,
      {
        commissionId: bid.commissionId,
        id: Not(bid.id),
        bidStatus: BidStatus.CREATED,
      },
      { bidStatus: BidStatus.REJECTED },
    );

    return savedBid;
  }

  async withdrawBid(
    id: string,
    userId: string,
    em?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = em ?? this.em;

    const bid = await manager.findOne(Bid, { where: { id } });
    if (!bid) throw new NotFoundError("Bid not found");
    if (bid.developerId !== userId) throw new UnauthorizedError();

    switch (bid.bidStatus) {
      case BidStatus.CREATED:
        return manager.softDelete(Bid, id);
      case BidStatus.ACCEPTED:
        await manager.update(
          Bid,
          {
            commissionId: bid.commissionId,
            id: Not(bid.id),
            bidStatus: BidStatus.REJECTED,
          },
          { bidStatus: BidStatus.CREATED },
        );
        return manager.softDelete(Bid, id);
      default:
        throw new RequestError(
          `Cannot withdraw a bid with status: ${bid.bidStatus}`,
        );
    }
  }

  async findByCommissionId(
    commissionId: string,
    em?: EntityManager,
  ): Promise<Bid[]> {
    const manager = em ?? this.em;

    if (!(await this.commissionRepo.findById(commissionId, manager)))
      throw new NotFoundError("Commission Not Found");

    return manager.find(Bid, {
      where: {
        commissionId: commissionId,
        bidStatus: Not(BidStatus.WITHDRAWN),
      },
    });
  }

  async findByUserId(userId: string, em?: EntityManager): Promise<Bid[]> {
    const manager = em ?? this.em;
    if (!(await this.userRepo.findById(userId, manager)))
      throw new NotFoundError("User Not Found");

    return manager.find(Bid, { where: { developerId: userId } });
  }

  async findById(id: string, em?: EntityManager): Promise<Bid> {
    const manager = em ?? this.em;
    const bid = await manager.findOne(Bid, { where: { id: id } });
    if (!bid) throw new NotFoundError("Bid Not Found");
    return bid;
  }
}
