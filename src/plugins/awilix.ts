import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { diContainer, fastifyAwilixPlugin } from "@fastify/awilix";
import {asClass, asFunction, asValue, InjectionMode} from "awilix";
import config from "../config";
import { AuthContainer } from "../modules/auth/auth.container";
import { UserContainer } from "../modules/user/user.container";
import { LoggerContainer } from "../modules/log/logger.container";
import { CommissionContainer } from "../modules/commission/commission.container";
import { BidContainer } from "../modules/bid/bid.container";
import { ProposalContainer } from "../modules/proposal/proposal.container";
import { ReviewContainer } from "../modules/review/review.container";
import { NotificationContainer } from "../modules/notification/notification.container";
import {WsService} from "../modules/socket/ws.service";
import {ChatContainer} from "../modules/chat/chat.container";

const awilixPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  await fastify.register(fastifyAwilixPlugin, {
    injectionMode: InjectionMode.PROXY,
    disposeOnClose: true,
    disposeOnResponse: true,
  });

  diContainer.register({
    orm: asValue(fastify.orm),
    em: asFunction(({ orm }) => orm.manager).scoped(),
    config: asValue(config),
    wsService: asClass(WsService).singleton().classic(),
    ...AuthContainer,
    ...UserContainer,
    ...LoggerContainer,
    ...CommissionContainer,
    ...BidContainer,
    ...ProposalContainer,
    ...ReviewContainer,
    ...NotificationContainer,
    ...ChatContainer
  });
  // fastify.addHook("onRequest", (req: FastifyRequest, res: FastifyReply) => {});
};

export default fp(awilixPlugin);
