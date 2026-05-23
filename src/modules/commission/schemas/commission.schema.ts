import {
  Commission,
  CommissionType,
} from "../../../entities/commission.entity";

export const CreateCommissionSchema = {
  body: {
    type: "object",
    required: ["type", "title", "budgetMin"],
    properties: {
      type: {
        type: "string",
        enum: Object.values(CommissionType),
      },
      title: { type: "string" },
      description: { type: "string", default: "" },
      functionality: { type: "string", default: "" },
      designLink: {
        type: "string",
        pattern: "^(https?://.*)?$",
        default: "",
      },
      budgetMin: { type: "number" },
      budgetMax: { type: "number", nullable: true },
      deadLine: {
        type: "string",
        format: "date-time",
      },
      references: {
        type: "array",
        items: {
          type: "string",
          format: "uri",
        },
      },
    },
  },
};

export const EditCommissionSchema = {
  params: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
    },
    required: ["id"],
  },
  body: {
    type: "object",
    additionalProperties: false,
    properties: {
      type: {
        type: "string",
        enum: Object.values(CommissionType),
      },
      title: { type: "string" },
      description: { type: "string", default: "" },
      functionality: { type: "string", default: "" },
      designLink: {
        type: "string",
        pattern: "^(https?://.*)?$",
        default: "",
      },
      budgetMin: { type: "number" },
      budgetMax: { type: "number" },
      deadLine: {
        type: "string",
        format: "date-time",
      },
      references: {
        type: "array",
        items: {
          type: "string",
          format: "uri",
        },
      },
    },
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

export const CommissionSearchSchema = {
  querystring: {
    type: "object",
    properties: {
      page: {
        type: "integer",
        default: 1,
        minimum: 1,
      },
      limit: {
        type: "integer",
        default: 7,
        minimum: 1,
        maximum: 50,
      },
      keywords: {
        type: "string",
      },
      commissionType: {
        type: "string",
        enum: Object.values(CommissionType),
      },
      budgetFrom: {
        type: "integer",
        minimum: 0,
      },
      budgetTo: {
        type: "integer",
        minimum: 0,
      },
      sortBy: {
        type: "string",
        enum: ["highest_budget", "lowest_budget", "fresh", "soonest_deadline"],
        default: "fresh",
      },
    },
    additionalProperties: false,
  },
};

export interface CommissionSearchQuery {
  page?: number;
  limit?: number;
  keywords?: string;
  commissionType?: CommissionType;
  budgetFrom?: number;
  budgetTo?: number;
  sortBy?: "high_budget" | "low_budget" | "fresh" | "soonest";
}

export interface CommissionSearchResponse {
  meta: { total: number; page: number; lastPage: number };
  data: Commission[];
}
