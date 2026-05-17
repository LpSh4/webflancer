// import { EntityManager } from "typeorm";
import { CommissionService } from "./commission.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateCommissionData, EditCommissionData } from "./commission.types";
import { Commission, CommissionType } from "../../entities/commission.entity";
import { CommissionProgress } from "../../entities/commission.enums";

export class CommissionController {
  constructor(
    // private em: EntityManager,
    private commissionService: CommissionService,
  ) {}

  createCommission = async (
    req: FastifyRequest<{
      Body: CreateCommissionData;
    }>,
    res: FastifyReply,
  ): Promise<Commission> => {
    req.body.clientId = req.user.id;
    const commission = await this.commissionService.createCommission(req.body);
    return res.status(201).send(commission);
  };

  editCommission = async (
    req: FastifyRequest<{
      Body: EditCommissionData;
    }>,
    res: FastifyReply,
  ): Promise<never> => {
    await this.commissionService.editCommission(req.body);

    return res.status(204).send();
  };

  toggleArchivedCommission = async (
    req: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
    res: FastifyReply,
  ): Promise<never> => {
    await this.commissionService.toggleArchivedCommission(
      req.params.id,
      req.user.id,
    );
    return res.status(204).send();
  };

  getTypes = async (
    req: FastifyRequest,
    res: FastifyReply,
  ): Promise<CommissionType[]> => {
    const commissions = await this.commissionService.getTypes();

    return res.status(200).send(commissions);
  };

  getById = async (
    req: FastifyRequest<{
      Params: { targetId: string };
    }>,
    res: FastifyReply,
  ): Promise<Commission> => {
    const commission = await this.commissionService.getCommission(
      req.params.targetId,
    );

    return res.status(200).send(commission);
  };

  getByUserId = async (
    req: FastifyRequest<{ Params: { targetId: string } }>,
    res: FastifyReply,
  ): Promise<Commission[]> => {
    const commissions = await this.commissionService.getUserCommissions(
      req.params.targetId,
    );

    return res.status(200).send(commissions);
  };

  getProgresses = async (
    req: FastifyRequest,
    res: FastifyReply,
  ): Promise<CommissionProgress[]> => {
    const progresses = await this.commissionService.getProgresses();

    return res.status(200).send(progresses);
  };
}
