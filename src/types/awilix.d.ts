import { AuthController } from "../modules/auth/auth.controller";
import { JwtService } from "../modules/auth/jwt.service";
import { UserController } from "../modules/user/user.controller";
import { LoggerController } from "../modules/log/logger.controller";
import { CommissionController } from "../modules/commission/commission.controller";
import { BidController } from "../modules/bid/bid.controller";
import { ProposalController } from "../modules/proposal/proposal.controller";
declare module "@fastify/awilix" {
  interface Cradle {
    authController: AuthController;
    jwtService: JwtService;
    userController: UserController;
    loggerController: LoggerController;
    commissionController: CommissionController;
    bidController: BidController;
    proposalController: ProposalController;
  }
}
