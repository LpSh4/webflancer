import { BidService } from "./bid.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { Bid } from "../../entities/bid.entity";

export class BidController {
  constructor(private bidService: BidService) {}

  createBid = async (
    req: FastifyRequest<{
      Params: { targetId: string };
    }>,
    res: FastifyReply,
  ): Promise<Bid> => {
    const bid = this.bidService.createBid({
      devId: req.user.id,
      targetId: req.params.targetId,
    });

    return res.status(201).send(bid);
  };

  acceptBid = async (
    req: FastifyRequest<{
      Params: { targetId: string };
    }>,
    res: FastifyReply,
  ): Promise<never> => {
    await this.bidService.acceptBid(req.params.targetId, req.user.id);

    return res.status(204).send();
  };

  withdrawBid = async (
    req: FastifyRequest<{
      Params: { targetId: string };
    }>,
    res: FastifyReply,
  ): Promise<never> => {
    await this.bidService.withdrawBid(req.params.targetId, req.user.id);

    return res.status(204).send();
  };

  findByCommissionId = async (
    req: FastifyRequest<{
      Params: { targetId: string };
    }>,
    res: FastifyReply,
  ): Promise<Bid[]> => {
    const bids = await this.bidService.getBidByCommissionId(
      req.params.targetId,
    );

    return res.status(200).send(bids);
  };

  findByUserId = async (
    req: FastifyRequest<{
      Params: { targetId: string };
    }>,
    res: FastifyReply,
  ): Promise<Bid[]> => {
    const bids = await this.bidService.getBidByUserId(req.params.targetId);

    return res.status(200).send(bids);
  };

  findById = async (
    req: FastifyRequest<{
      Params: { targetId: string };
    }>,
    res: FastifyReply,
  ): Promise<Bid[]> => {
    const bid = await this.bidService.getBidById(req.params.targetId);
    return res.status(200).send(bid);
  };
}
