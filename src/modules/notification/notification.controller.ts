import { FastifyReply, FastifyRequest } from "fastify";
import { NotificationService } from "./notification.service";
import { Notification } from "../../entities/notification.entity";

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  getMyNotifications = async (
    req: FastifyRequest,
    res: FastifyReply,
  ): Promise<Notification[]> => {
    const list = await this.notificationService.getMyNotifications(req.user.id);
    return res.status(200).send(list);
  };

  markRead = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    res: FastifyReply,
  ): Promise<never> => {
    await this.notificationService.readNotification(req.params.id, req.user.id);
    return res.status(204).send();
  };

  markAllRead = async (
    req: FastifyRequest,
    res: FastifyReply,
  ): Promise<never> => {
    await this.notificationService.readAllNotifications(req.user.id);
    return res.status(204).send();
  };
}
