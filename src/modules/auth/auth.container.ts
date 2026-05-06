import { asClass } from "awilix";
import { HashService } from "./hash.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RefreshTokenRepository } from "./refresh-token.repository";
import { JwtService } from "./jwt.service";

export const AuthContainer = {
  jwtService: asClass(JwtService).singleton().classic(),
  hashService: asClass(HashService).scoped().classic(),
  refreshTokenRepo: asClass(RefreshTokenRepository).scoped().classic(),
  authService: asClass(AuthService).scoped().classic(),
  authController: asClass(AuthController).scoped().classic(),
};
