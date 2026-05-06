export const loginSchema = {
  body: {
    type: "object",
    required: ["login", "password"],
    additionalProperties: false,
    properties: {
      login: { type: "string", minLength: 3, maxLength: 255 },
      password: { type: "string", minLength: 6, maxLength: 255 },
    },
  },
};
