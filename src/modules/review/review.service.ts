import { ReviewRepository } from "./review.repository";
import { EntityManager } from "typeorm";
import { CreateReviewData } from "./review.types";
import { Review } from "../../entities/review.entity";

export class ReviewService {
  constructor(
    private reviewRepo: ReviewRepository,
    private em: EntityManager,
  ) {}

  async createReview(data: CreateReviewData): Promise<Review> {
    return this.em.transaction(async (trxEm): Promise<Review> => {
      return this.reviewRepo.createReview(data, trxEm);
    });
  }

  async getById(id: string): Promise<Review> {
    return this.reviewRepo.getById(id, this.em);
  }

  async getByCommissionId(commissionId: string): Promise<Review> {
    return this.reviewRepo.getByCommissionId(commissionId, this.em);
  }

  async getByUserId(userId: string): Promise<Review[]> {
    return this.reviewRepo.getByUserId(userId, this.em);
  }
}
