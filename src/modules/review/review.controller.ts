import { ReviewService } from "./review.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateReviewData } from "./review.types";
import { Review } from "../../entities/review.entity";

export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  createReview = async (
    req: FastifyRequest<{
      Body: CreateReviewData;
    }>,
    res: FastifyReply,
  ): Promise<Review> => {
    const review = await this.reviewService.createReview(req.body);

    return res.status(201).send(review);
  };

  getById = async (
    req: FastifyRequest<{
      Params: {
        targetId: string;
      };
    }>,
    res: FastifyReply,
  ): Promise<Review> => {
    const review = await this.reviewService.getById(req.params.targetId);

    return res.status(200).send(review);
  };

  getByCommissionId = async (
    req: FastifyRequest<{
      Params: {
        targetId: string;
      };
    }>,
    res: FastifyReply,
  ): Promise<Review> => {
    const review = await this.reviewService.getByCommissionId(
      req.params.targetId,
    );

    return res.status(200).send(review);
  };

  getByUserId = async (
    req: FastifyRequest<{
      Params: {
        targetId: string;
      };
    }>,
    res: FastifyReply,
  ): Promise<Review[]> => {
    const reviews = await this.reviewService.getByUserId(req.params.targetId);

    return res.status(200).send(reviews);
  };
}
