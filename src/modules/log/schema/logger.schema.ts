export const getByIdSchema = {
  params: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" }, // Enforces UUID format
    },
    required: ["id"],
  },
};
