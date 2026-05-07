import Fastify, { FastifyInstance } from "fastify";
import config from "./config";
import corsPlugin from "./plugins/cors";
import diPlugin from "./plugins/awilix";
import cookiePlugin from "./plugins/cookie";
import { DataSource } from "typeorm";
import { initORM } from "./infrastructure";
import { AuthRoutes } from "./modules/auth/auth.route";
import { userRoutes } from "./modules/user/user.route";
// import ioPlugin from "./plugins/socket";

interface FastifyOptions {
  logger: any;
  ajv: any;
}

declare module "fastify" {
  interface FastifyInstance {
    orm: DataSource;
  }
}

class Server {
  fastify: FastifyInstance;
  orm!: DataSource;

  constructor() {
    const isDev = config.node_env === "development";
    this.fastify = Fastify({
      logger: {
        level: "debug",
        transport: isDev
          ? {
              target: "pino-pretty",
              options: { colorized: true },
            }
          : undefined,
      },
      ajv: { customOptions: { coerceTypes: true } },
    } as FastifyOptions);
  }

  async startHttpServer() {
    const address = await this.fastify.listen({
      host: config.host,
      port: config.port,
    });
    this.fastify.log.info(
      `Server is listening on ${address}/${config.apiPrefix}`,
    );
  }

  async registerPlugins() {
    this.fastify.decorate("orm", this.orm);
    await this.fastify.register(corsPlugin);
    await this.fastify.register(diPlugin);
    await this.fastify.register(cookiePlugin);
    // await this.fastify.register(ioPlugin);
  }

  async registerRoutes() {
    await this.fastify.register(AuthRoutes, {
      prefix: `${config.apiPrefix}/auth`,
    });

    await this.fastify.register(userRoutes, {
      prefix: `${config.apiPrefix}/users`,
    });
  }

  async initInfrastructure() {
    this.orm = await initORM();
    this.fastify.log.info(`Database initialized`);
  }

  async start() {
    await this.initInfrastructure();
    await this.registerPlugins();
    await this.registerRoutes();
    await this.startHttpServer();
  }
}

(async () => {
  const app = new Server();
  try {
    await app.start();
  } catch (e) {
    console.error(`Failed to start: ${e}`);
    process.exit(1);
  }
})();
