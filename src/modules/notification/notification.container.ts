import { asClass } from "awilix";
import { NotificationRepository } from "./notification.repository";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";

export const NotificationContainer = {
  notificationRepo: asClass(NotificationRepository).scoped().classic(),
  notificationController: asClass(NotificationController).scoped().classic(),
  notificationService: asClass(NotificationService).scoped().classic(),
};
