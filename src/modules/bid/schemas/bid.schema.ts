export const BidSchema = {
  params: {
    type: "object",
    properties: {
      targetId: { type: "string", format: "uuid" },
    },
    required: ["targetId"],
  },
};
