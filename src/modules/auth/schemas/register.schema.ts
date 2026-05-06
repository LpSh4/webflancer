import { Role } from "../../../entities/user.entity";

export const registerSchema = {
  body: {
    type: "object",
    required: ["role", "login", "password", "email", "phoneNumber", "name"],
    additionalProperties: false,
    properties: {
      role: { type: "string", enum: Object.values(Role) },
      login: { type: "string" },
      password: { type: "string" },
      email: { type: "string", format: "email" },
      phoneNumber: { type: "string", pattern: "^89\\d{9}$" },
      name: { type: "string" },
    },
  },
};
