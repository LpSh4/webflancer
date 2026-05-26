import { CommissionRepository } from "../commission/commission.repository";
import { UserRepository } from "../user/user.repository";
import { EntityManager, UpdateResult } from "typeorm";
import { Review } from "../../entities/review.entity";
import { NotFoundError, RequestError } from "../../errors/errors";
import { Role, User } from "../../entities/user.entity";
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

    const [user, commission] = await Promise.all([
      this.userRepo.findById(userId, manager),
      this.commissionRepo.findById(commissionId, manager),
    ]);

    if (!user) throw new NotFoundError("User does not exist");
    if (!commission) throw new NotFoundError("Commission does not exist");
    if (!commission.developerId) {
      throw new RequestError("No developer assigned to this commission");
    }
    if (commission.commissionProgress !== CommissionProgress.COMPLETED) {
      throw new RequestError(
        "Reviews can only be left for completed commissions",
      );
    }

    let review = await manager.findOne(Review, { where: { commissionId } });
    if (!review) {
      review = manager.create(Review, { commissionId });
    }

    switch (user.role) {
      case Role.CLIENT:
        if (review.clientRating != null) {
          throw new RequestError("Client has already reviewed this commission");
        }
        review.clientId = user.id;
        review.clientReview = content;
        review.clientRating = rating;

        await this.calculateReviews(commission.developerId, rating, manager);
        break;

      case Role.DEVELOPER:
        if (review.developerRating != null) {
          throw new RequestError(
            "Developer has already reviewed this commission",
          );
        }
        review.developerId = user.id;
        review.developerReview = content;
        review.developerRating = rating;

        await this.calculateReviews(commission.clientId, rating, manager);
        break;

      default:
        throw new RequestError("Invalid role for submitting reviews");
    }

    return manager.save(Review, review);
  }

  async calculateReviews(
    userId: string,
    rating: number,
    em?: EntityManager,
  ): Promise<UpdateResult> {
    const manager = em ?? this.em;

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User does not exist");

    const oldCount = user.reviewCount ?? 0;
    const newCount = oldCount + 1;

    const newAverage =
      Math.round(
        (((user.averageRating ?? 0) * oldCount + rating) / newCount) * 100,
      ) / 100;

    return manager.update(User, userId, {
      reviewCount: newCount,
      averageRating: newAverage,
    });
  }

  async getById(id: string, em?: EntityManager): Promise<Review> {
    const manager = em ?? this.em;

    const review = await manager.findOne(Review, { where: { id: id } });
    if (!review) throw new NotFoundError("Review does not exist");

    return review;
  }

  async getByCommissionId(
    commissionId: string,
    em?: EntityManager,
  ): Promise<Review> {
    const manager = em ?? this.em;

    const commission = await this.commissionRepo.findById(commissionId);
    if (!commission) throw new NotFoundError("Commission does not exist");

    const review = await manager.findOne(Review, {
      where: { commissionId: commission.id },
    });
    if (!review) throw new NotFoundError("Review does not exist");

    return review;
  }

  async getByUserId(userId: string, em?: EntityManager): Promise<Review[]> {
    const manager = em ?? this.em;

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User does not exist");

    switch (user.role) {
      case Role.CLIENT:
        return manager.find(Review, { where: { clientId: userId } });
      case Role.DEVELOPER:
        return manager.find(Review, { where: { developerId: userId } });
      default:
        throw new RequestError("Invalid user role");
    }
  }
}
