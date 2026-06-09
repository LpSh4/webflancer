import { CommissionRepository } from "../commission/commission.repository";
import { UserRepository } from "../user/user.repository";
import { EntityManager } from "typeorm";
import { Review } from "../../entities/review.entity";
import { User } from "../../entities/user.entity";
import {
  NotFoundError,
  RequestError,
  UnauthorizedError,
} from "../../errors/errors";
import { Role } from "../../entities/user.entity";
import { CommissionProgress } from "../../entities/commission.enums";
import { CreateReviewData } from "./review.types";

export class ReviewRepository {
  constructor(
    private commissionRepo: CommissionRepository,
    private userRepo: UserRepository,
    private em: EntityManager,
  ) {}

  async createReview(
    data: CreateReviewData,
    em?: EntityManager,
  ): Promise<Review> {
    const { userId, commissionId, rating, content = "" } = data;
    const manager = em ?? this.em;

    const user = await this.userRepo.findById(userId, manager);
    if (!user) throw new NotFoundError("User does not exist");

    const commission = await this.commissionRepo.findById(
      commissionId,
      manager,
    );
    if (!commission) throw new NotFoundError("Commission does not exist");

    if (!commission.developerId) {
      throw new RequestError("No developer assigned to this commission");
    }

    if (commission.commissionProgress !== CommissionProgress.COMPLETED) {
      throw new RequestError(
        "Reviews can only be left for completed commissions",
      );
    }

    // Find or create the basic review row framework
    let review = await manager.findOne(Review, { where: { commissionId } });
    if (!review) {
      review = await manager.save(
        Review,
        manager.create(Review, { commissionId }),
      );
    }

    let targetUserIdToUpdate = "";
    const updatePayload: Partial<Review> = {};

    if (user.role === Role.CLIENT) {
      if (commission.clientId !== user.id) {
        throw new UnauthorizedError(
          "You are not the client for this commission",
        );
      }
      if (review.clientRating != null) {
        throw new RequestError("Client has already reviewed this commission");
      }

      updatePayload.clientId = user.id;
      updatePayload.clientReview = content;
      updatePayload.clientRating = rating;
      targetUserIdToUpdate = commission.developerId;
    } else if (user.role === Role.DEVELOPER) {
      if (commission.developerId !== user.id) {
        throw new UnauthorizedError(
          "You are not the developer for this commission",
        );
      }
      if (review.developerRating != null) {
        throw new RequestError(
          "Developer has already reviewed this commission",
        );
      }

      updatePayload.developerId = user.id;
      updatePayload.developerReview = content;
      updatePayload.developerRating = rating;
      targetUserIdToUpdate = commission.clientId;
    } else {
      throw new RequestError("Invalid role for submitting reviews");
    }

    // Perform an isolated column-level update so data never cross-contaminates
    await manager.update(Review, review.id, updatePayload);

    // Recalculate average profiles on the user record securely
    await this.calculateReviews(targetUserIdToUpdate, rating, manager);

    // Return the complete fresh review record
    const freshReview = await manager.findOne(Review, {
      where: { id: review.id },
    });
    if (!freshReview) throw new NotFoundError("Error fetching updated review");

    return freshReview;
  }

  async calculateReviews(
    userId: string,
    rating: number,
    manager: EntityManager,
  ): Promise<void> {
    // Lock row for update to eliminate race conditions entirely
    const user = await manager.findOne(User, {
      where: { id: userId },
      lock: { mode: "pessimistic_write" },
    });

    if (!user)
      throw new NotFoundError(
        "Target user for rating calculation does not exist",
      );

    const oldCount = user.reviewCount ?? 0;
    const newCount = oldCount + 1;
    const currentAverage = user.averageRating ?? 0;

    // Precision float math
    const newAverage =
      Math.round(((currentAverage * oldCount + rating) / newCount) * 100) / 100;

    await manager.update(User, userId, {
      reviewCount: newCount,
      averageRating: newAverage,
    });
  }

  async getById(id: string, em?: EntityManager): Promise<Review> {
    const manager = em ?? this.em;
    const review = await manager.findOne(Review, { where: { id } });
    if (!review) throw new NotFoundError("Review does not exist");
    return review;
  }

  async getByCommissionId(
    commissionId: string,
    em?: EntityManager,
  ): Promise<Review> {
    const manager = em ?? this.em;
    const review = await manager.findOne(Review, { where: { commissionId } });
    if (!review)
      throw new NotFoundError("Review for this commission does not exist");
    return review;
  }

  async getByUserId(userId: string, em?: EntityManager): Promise<Review[]> {
    const manager = em ?? this.em;
    const user = await manager.findOne(User, { where: { id: userId } });
    if (!user) throw new NotFoundError("User does not exist");

    if (user.role === Role.CLIENT) {
      return manager.find(Review, {
        where: { clientId: userId },
        relations: { commission: true },
      });
    } else if (user.role === Role.DEVELOPER) {
      return manager.find(Review, {
        where: { developerId: userId },
        relations: { commission: true },
      });
    } else {
      throw new RequestError("This user role cannot contain review structures");
    }
  }
}
