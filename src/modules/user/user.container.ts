import { asClass } from "awilix";
import { UserRepository } from "./user.repository";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

export const UserContainer = {
  userRepo: asClass(UserRepository).scoped().classic(),
  userController: asClass(UserController).scoped().classic(),
  userService: asClass(UserService).scoped().classic(),
};
