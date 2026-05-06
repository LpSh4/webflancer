import { FastifyRequest } from "fastify";
import { JwtPayload } from "./jwt.service";
import { UnauthorizedError } from "../../errors/errors";

declare module "fastify" {
  interface FastifyRequest {
    user: JwtPayload;
  }
}
export const authenticate = async (req: FastifyRequest) => {
  // Check cookie first, fallback to Header for flexibility (like mobile apps)
  const token =
    req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new UnauthorizedError("Authentication required");
  }

  try {
    const { jwtService } = req.diScope.cradle;
    req.user = jwtService.verifyAccess(token);
  } catch (err) {
    throw new UnauthorizedError("Session invalid or expired");
  }
};
