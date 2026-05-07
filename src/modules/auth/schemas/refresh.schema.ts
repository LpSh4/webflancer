export const refreshSchema = {
  body: {
    type: "object",
    properties: {},
  },
  cookies: {
    type: "object",
    required: ["refresh_token"],
    properties: {
      refresh_token: { type: "string" },
    },
  },
};
