import { asClass } from "awilix";
import { ProposalRepository } from "./proposal.repository";
import { ProposalController } from "./proposal.controller";
import { ProposalService } from "./proposal.service";

export const ProposalContainer = {
  ProposalRepo: asClass(ProposalRepository).scoped().classic(),
  ProposalController: asClass(ProposalController).scoped().classic(),
  ProposalService: asClass(ProposalService).scoped().classic(),
};
