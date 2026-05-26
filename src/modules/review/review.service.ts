import { ReviewRepository } from "./review.repository";
import { EntityManager } from "typeorm";
import { CreateReviewData } from "./review.types";
import { Review } from "../../entities/review.entity";

export class ReviewService {
  constructor(
    private reviewRepo: ReviewRepository,
    private em: EntityManager,
  ) {}

  async createReview(
    data: CreateReviewData,
    em?: EntityManager,
  ): Promise<Review> {
    const manager = em ?? this.em;

    return manager.transaction(async (trxEm): Promise<Review> => {
      return this.reviewRepo.createReview(data, trxEm);
    });
  }

  async getById(id: string, em?: EntityManager): Promise<Review> {
    const manager = em ?? this.em;

    return this.reviewRepo.getById(id, manager);
  }

  async getByCommissionId(
    commissionId: string,
    em?: EntityManager,
  ): Promise<Review> {
    const manager = em ?? this.em;

    return manager.transaction(async (trxEm): Promise<Review> => {
      return this.reviewRepo.getByCommissionId(commissionId, trxEm);
    });
  }

  async getByUserId(userId: string, em?: EntityManager): Promise<Review[]> {
    const manager = em ?? this.em;

    return manager.transaction(async (trxEm): Promise<Review[]> => {
      return this.reviewRepo.getByUserId(userId, trxEm);
    });
  }
}
