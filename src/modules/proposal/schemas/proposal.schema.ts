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
        enum: Object.values(CommissionWorkStatus),
      },
    },
    required: ["workStatus", "id"],
  },
};

export const ChangeProposalStatusSchema = {
  body: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: Object.values(ProposalStatus),
      },
    },
    required: ["status"],
  },
  params: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
    },
    required: ["id"],
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
