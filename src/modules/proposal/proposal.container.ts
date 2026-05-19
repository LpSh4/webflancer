import { asClass } from "awilix";
import { ProposalRepository } from "./proposal.repository";
import { ProposalController } from "./proposal.controller";
import { ProposalService } from "./proposal.service";

export const ProposalContainer = {
  proposalRepo: asClass(ProposalRepository).scoped().classic(),
  proposalController: asClass(ProposalController).scoped().classic(),
  proposalService: asClass(ProposalService).scoped().classic(),
};
