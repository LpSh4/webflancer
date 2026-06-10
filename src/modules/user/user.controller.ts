// import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  UpdateEmailData,
  UpdateProfilePictureData,
  UpdateUserData,
} from "./user.types";
import { User } from "../../entities/user.entity";

export class UserController {
  constructor(
    // private userRepo: UserRepository,
    private userService: UserService,
  ) {}

  updateProfile = async (
    req: FastifyRequest<{
      Body: UpdateUserData;
    }>,
    res: FastifyReply,
  ): Promise<never> => {
    const { id } = req.body;
    await this.userService.updateUser(id, req.body);
    return res.status(204).send();
  };

  updateEmail = async (
    req: FastifyRequest<{
      Body: UpdateEmailData;
    }>,
    res: FastifyReply,
  ): Promise<never> => {
    const { id } = req.body;
    await this.userService.updateEmail(id, req.body.email);
    return res.status(204).send();
  };

  updateProfilePicture = async (
    req: FastifyRequest<{
      Body: UpdateProfilePictureData;
    }>,
    res: FastifyReply,
  ): Promise<never> => {
    const { id } = req.body;
    await this.userService.updateProfilePicture(id, req.body.profilePicture);
    return res.status(204).send();
  };

  getMe = async (req: FastifyRequest, res: FastifyReply): Promise<User> => {
    const user = await this.userService.getUser(req.user.id);
    return res.status(200).send(user);
  };

  getUser = async (
    req: FastifyRequest<{ Params: { targetId: string } }>,
    res: FastifyReply,
  ): Promise<User> => {
    const user = await this.userService.getUser(req.params.targetId);
    return res.status(200).send(user);
  };
}
