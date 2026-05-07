// import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { UpdateUserData } from "./user.types";

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
}
