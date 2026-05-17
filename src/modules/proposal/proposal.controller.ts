import { ProposalService } from "./proposal.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { CommissionProposal } from "../../entities/commission.entity.proposals";
import {
  CommissionWorkStatus,
  ProposalStatus,
} from "../../entities/commission.enums";

export class ProposalController {
  constructor(private proposalService: ProposalService) {}

  createProposal = async (
    req: FastifyRequest<{
      Body: {
        id: string;
        workStatus: CommissionWorkStatus;
      };
    }>,
    res: FastifyReply,
  ): Promise<CommissionProposal> => {
    const proposal = await this.proposalService.createProposal(
      req.body.id,
      req.user.id,
      req.body.workStatus,
    );

    return res.status(201).send(proposal);
  };

  changeStatus = async (
    req: FastifyRequest<{
      Body: {
        id: string;
        status: ProposalStatus;
      };
    }>,
    res: FastifyReply,
  ): Promise<never> => {
    await this.proposalService.changeStatus(
      req.body.id,
      req.body.status,
      req.user.id,
    );

    return res.status(204).send();
  };

  acceptAll = async (
    req: FastifyRequest<{
      Params: {
        targetId: string;
      };
    }>,
    res: FastifyReply,
  ): Promise<never> => {
    await this.proposalService.acceptAll(req.params.targetId, req.user.id);

    return res.status(204).send();
  };

  view = async (
    req: FastifyRequest<{
      Params: {
        targetId: string;
      };
    }>,
    res: FastifyReply,
  ): Promise<CommissionProposal> => {
    const proposal = await this.proposalService.findById(
      req.params.targetId,
      req.user.id,
    );

    return res.status(200).send(proposal);
  };

  viewCommission = async (
    req: FastifyRequest<{
      Params: {
        targetId: string;
      };
    }>,
    res: FastifyReply,
  ): Promise<CommissionProposal[]> => {
    const proposals = await this.proposalService.findByCommissionId(
      req.params.targetId,
      req.user.id,
    );

    return res.status(200).send(proposals);
  };
}
