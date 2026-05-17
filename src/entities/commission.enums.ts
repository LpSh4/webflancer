export enum ProposalStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  TIMED_OUT = "TIMED_OUT",
}

export enum CommissionProgress {
  // Initial Phase
  POSTED = "POSTED", // Visible to developers, accepting applications
  ARCHIVED = "ARCHIVED", // Client archived the commission, not visible to developers

  // Development Phase (The "Workplace")
  CONTRACT_STARTED = "CONTRACT_STARTED", // Developer hired, work begins
  DEVELOPMENT = "DEVELOPMENT", // Coding in progress
  TESTING = "TESTING", // Developer is bug-fixing, Client is testing

  // Completion/Termination
  COMPLETED = "COMPLETED", // Project finished successfully, review left
  CANCELLED = "CANCELLED", // Project stopped by either party
  DISPUTED = "DISPUTED", // Conflict (Admin/Moderator intervention needed)
  REFUNDED = "REFUNDED", // Payment returned to client
}

export enum CommissionWorkStatus {
  // Setup & Planning
  PENDING = "PENDING", // Work assigned but hasn't physically started yet
  REQUIREMENTS_GATHERING = "REQUIREMENTS", // Initial sync, creating wireframes, defining specs

  // Design Phase
  UI_UX_DESIGN = "UI_UX_DESIGN", // Designing layouts, Figma mockups, user flows

  // Engineering & Development
  DATABASE_ARCHITECTURE = "DB_DESIGN", // Designing schemas, migrations, structuring database
  BACKEND_DEVELOPMENT = "BACKEND_DEV", // Writing APIs, business logic, integrations
  FRONTEND_DEVELOPMENT = "FRONTEND_DEV", // Building UI, components, connecting to backend
  DEVOPS_ESTABLISHMENT = "DEVOPS_EST", // Hosting an application
  FULLSTACK_INTEGRATION = "INTEGRATION", // Gluing frontend and backend together, data flow checks

  // Review & Polishing
  PRODUCTION = "PRODUCTION", // The website is in the production
}
