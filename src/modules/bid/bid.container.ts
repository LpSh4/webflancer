import { BidRepository } from "./bid.repository";
import { asClass } from "awilix";
import { BidController } from "./bid.controller";
import { BidService } from "./bid.service";

export const BidContainer = {
  bidRepo: asClass(BidRepository).scoped().classic(),
  bidController: asClass(BidController).scoped().classic(),
  bidService: asClass(BidService).scoped().classic(),
};
