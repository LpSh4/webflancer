import { FastifyInstance, FastifyPluginAsync } from "fastify";
import cookie from "@fastify/cookie";
import fp from "fastify-plugin";

const cookiePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  await fastify.register(cookie, {
    secret: "my-secret-key",
    hook: "onRequest",
  });
};

export default fp(cookiePlugin);
