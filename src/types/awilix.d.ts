import { AuthController } from "../modules/auth/auth.controller";
import { JwtService } from "../modules/auth/jwt.service";
declare module "@fastify/awilix" {
  interface Cradle {
    authController: AuthController;
    jwtService: JwtService;
  }
}
