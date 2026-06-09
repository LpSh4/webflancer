import { asClass } from "awilix";
import { ReviewRepository } from "./review.repository";
import { ReviewController } from "./review.controller";
import { ReviewService } from "./review.service";

export const ReviewContainer = {
  reviewRepo: asClass(ReviewRepository).scoped().classic(),
  reviewController: asClass(ReviewController).scoped().classic(),
  reviewService: asClass(ReviewService).scoped().classic(),
};
