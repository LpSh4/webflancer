import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { Server } from "socket.io";
import config from "../config";

declare module "fastify" {
    interface FastifyInstance {
        io: Server;
    }
}

const ioPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    const io = new Server(fastify.server, {
        path: "/api/v1/socket.io",
        cors: {
            origin: [config.frontendUrl, "*"],
            methods: ["GET", "POST"]
        }
    });

    fastify.decorate("io", io);

    fastify.addHook("onClose", (fastify, done) => {
        fastify.io.close();
        done();
    });
};

export default fp(ioPlugin);