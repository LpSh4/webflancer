export const CreateReviewSchema = {
  body: {
    type: "object",
    properties: {
      rating: { type: "number", minimum: 1, maximum: 5 },
      content: { type: "string" },
    },
    required: ["rating"],
  },
};
