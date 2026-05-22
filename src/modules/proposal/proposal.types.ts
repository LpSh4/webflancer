import {
  CommissionProgress,
  CommissionWorkStatus,
} from "../../entities/commission.enums";

export const workStatusToProgressMap: {
  [CommissionWorkStatus.PENDING]: CommissionProgress;
  [CommissionWorkStatus.UI_UX_DESIGN]: CommissionProgress;
  [CommissionWorkStatus.DATABASE_ARCHITECTURE]: CommissionProgress;
  [CommissionWorkStatus.BACKEND_DEVELOPMENT]: CommissionProgress;
  [CommissionWorkStatus.FRONTEND_DEVELOPMENT]: CommissionProgress;
  [CommissionWorkStatus.DEVOPS_ESTABLISHMENT]: CommissionProgress;
  [CommissionWorkStatus.FULLSTACK_INTEGRATION]: CommissionProgress;
  [CommissionWorkStatus.PRODUCTION]: any;
} = {
  [CommissionWorkStatus.PENDING]: CommissionProgress.POSTED, // Added the missing default/pending state

  // Development Phase
  [CommissionWorkStatus.UI_UX_DESIGN]: CommissionProgress.DEVELOPMENT,
  [CommissionWorkStatus.DATABASE_ARCHITECTURE]: CommissionProgress.DEVELOPMENT, // Maps to "DB_DESIGN"
  [CommissionWorkStatus.BACKEND_DEVELOPMENT]: CommissionProgress.DEVELOPMENT, // Maps to "BACKEND_DEV"
  [CommissionWorkStatus.FRONTEND_DEVELOPMENT]: CommissionProgress.DEVELOPMENT, // Maps to "FRONTEND_DEV"

  // Testing Phase
  [CommissionWorkStatus.DEVOPS_ESTABLISHMENT]: CommissionProgress.TESTING, // Maps to "DEVOPS_EST"
  [CommissionWorkStatus.FULLSTACK_INTEGRATION]: CommissionProgress.TESTING, // Maps to "INTEGRATION"

  // Production Phase
  [CommissionWorkStatus.PRODUCTION]: CommissionProgress.DEVELOPMENT_COMPLETE,
};
