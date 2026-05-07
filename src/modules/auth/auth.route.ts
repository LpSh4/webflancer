import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { registerSchema } from "./schemas/register.schema";
import { CreateUserData, LoginData } from "../user/user.types";
import { loginSchema } from "./schemas/login.schema";
import { Role } from "../../entities/user.entity";
import { LoginTokens } from "./auth.service";
import { refreshSchema } from "./schemas/refresh.schema";
import { logoutSchema } from "./schemas/logout.schema";

export type SafeUser = {
  id: string;
  login: string;
  displayedName: string;
  role: Role;
};

export async function AuthRoutes(fastify: FastifyInstance): Promise<void> {
  const resolve = (req: FastifyRequest) => req.diScope.cradle.authController;

  fastify.post(
    "/register",
    { schema: registerSchema },
    (
      req: FastifyRequest<{ Body: CreateUserData }>,
      res: FastifyReply,
    ): Promise<SafeUser> => {
      return resolve(req).register(req, res);
    },
  );

  fastify.post(
    "/login",
    { schema: loginSchema },
    (
      req: FastifyRequest<{ Body: LoginData }>,
      res: FastifyReply,
    ): Promise<LoginTokens> => {
      return resolve(req).login(req, res);
    },
  );

  fastify.post<{
    Body: { refreshToken: string };
  }>(
    "/refresh",
    { schema: refreshSchema },
    async (req, reply): Promise<LoginTokens> => {
      return resolve(req).refresh(req, reply);
    },
  );

  fastify.post<{}>(
    "/logout",
    { schema: logoutSchema },
    async (req, reply): Promise<never> => {
      return resolve(req).logout(req, reply);
    },
  );
}
