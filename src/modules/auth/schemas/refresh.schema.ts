export const refreshSchema = {
  cookies: {
    type: "object",
    required: ["refresh_token"],
    properties: {
      refresh_token: { type: "string" },
    },
  },
};
