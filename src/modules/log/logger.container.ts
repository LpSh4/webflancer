import { LoggerRepository } from "./logger.repository";
import { asClass } from "awilix";
import { LoggerService } from "./logger.service";
import { LoggerController } from "./logger.controller";

export const LoggerContainer = {
  loggerRepo: asClass(LoggerRepository).scoped().classic(),
  loggerService: asClass(LoggerService).scoped().classic(),
  loggerController: asClass(LoggerController).scoped().classic(),
};
