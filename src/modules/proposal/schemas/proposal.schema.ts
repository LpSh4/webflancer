import {
  CommissionWorkStatus,
  ProposalStatus,
} from "../../../entities/commission.enums";

export const CreateProposalSchema = {
  body: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      workStatus: {
        type: "string",
        values: Object.values(CommissionWorkStatus),
      },
    },
    required: ["workStatus", "id"],
  },
};

export const ChangeProposalStatusSchema = {
  body: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      status: {
        type: "string",
        values: Object.values(ProposalStatus),
      },
    },
    required: ["status", "id"],
  },
};

export const AcceptProposalsSchema = {
  params: {
    type: "object",
    properties: {
      targetId: { type: "string", format: "uuid" },
    },
    required: ["targetId"],
  },
};

export const getByIdSchema = {
  params: {
    type: "object",
    properties: {
      targetId: { type: "string", format: "uuid" }, // Enforces UUID format
    },
    required: ["targetId"],
  },
};
