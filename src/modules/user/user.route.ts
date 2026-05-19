import { FastifyInstance, FastifyRequest } from "fastify";
import { authenticate } from "../auth/auth.middleware";
import {
  UpdateEmailData,
  UpdateProfilePictureData,
  UpdateUserData,
} from "./user.types";
import { Role, User } from "../../entities/user.entity";
import {
  getByIdSchema,
  updateAvatarSchema,
  updateEmailSchema,
  updateUserSchema,
} from "./schemas/user.schema";

export async function userRoutes(fastify: FastifyInstance) {
  const resolve = (req: FastifyRequest<any>) =>
    req.diScope.cradle.userController;

  fastify.patch<{
    Body: UpdateUserData;
  }>(
    "/profile",
    { preHandler: [authenticate], schema: updateUserSchema },
    async (req, res): Promise<never> => {
      req.body.role = req.user.role as Role;
      req.body.id = req.user.id;

      return resolve(req).updateProfile(req, res);
    },
  );

  fastify.patch<{
    Body: UpdateProfilePictureData;
  }>(
    "/avatar",
    { preHandler: [authenticate], schema: updateAvatarSchema },
    async (req, res): Promise<never> => {
      req.body.id = req.user.id;

      return resolve(req).updateProfilePicture(req, res);
    },
  );

  fastify.patch<{ Body: UpdateEmailData }>(
    "/email",
    { preHandler: [authenticate], schema: updateEmailSchema },
    async (req, res): Promise<never> => {
      req.body.id = req.user.id;

      return resolve(req).updateEmail(req, res);
    },
  );

  fastify.get(
    "/me",
    { preHandler: [authenticate] },
    async (req, res): Promise<User> => {
      return resolve(req).getMe(req, res);
    },
  );

  fastify.get<{
    Params: {
      id: string;
    };
  }>(
    "/:id",
    { preHandler: [authenticate], schema: getByIdSchema },
    async (req, res): Promise<User> => {
      return resolve(req).getUser(req, res);
    },
  );
}
