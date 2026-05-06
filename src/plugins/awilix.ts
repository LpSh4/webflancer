import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { diContainer, fastifyAwilixPlugin } from "@fastify/awilix";
import { asFunction, asValue, InjectionMode } from "awilix";
import config from "../config";
import { AuthContainer } from "../modules/auth/auth.container";
import { UserContainer } from "../modules/user/user.container";

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
    ...AuthContainer,
    ...UserContainer,
  });
  // fastify.addHook("onRequest", (req: FastifyRequest, res: FastifyReply) => {});
};

export default fp(awilixPlugin);
