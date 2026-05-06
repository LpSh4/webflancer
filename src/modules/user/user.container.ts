import { asClass } from "awilix";
import { UserRepository } from "./user.repository";

export const UserContainer = {
  userRepo: asClass(UserRepository).scoped().classic(),
};
