export const updateUserSchema = {
  body: {
    type: "object",
    properties: {
      login: { type: "string" },
      phoneNumber: {
        type: "string",
        pattern: "^89\\d{9}$",
      },
      name: { type: "string" },
      surname: { type: "string" },
      displayedName: { type: "string" },
      companyName: { type: "string" },
      companyLink: { type: "string", format: "uri" },
      socialGitHub: {
        type: "string",
        pattern: "^https?:\/\/(www\.)?github\.com\/.*$",
      },
      socialLinkedIn: {
        type: "string",
        pattern: "^https?:\/\/(www\.)?linkedin/\.com\/.*$",
      },
      socialX: {
        type: "string",
        pattern: "^https?:\/\/(www\.)?x\.com\/.*$",
      },
      portfolioLinks: {
        type: "array",
        items: {
          type: "string",
          format: "uri",
        },
      },
      bio: { type: "string" },
      avgHourlyRate: { type: "number" },
    },
  },
};

export const updateEmailSchema = {
  body: {
    type: "object",
    required: ["email"],
    properties: {
      email: {
        type: "string",
        format: "email",
      },
    },
  },
};

export const updateAvatarSchema = {
  body: {
    type: "object",
    required: ["profilePicture"],
    properties: {
      profilePicture: {
        type: "string",
        format: "uri",
      },
    },
  },
};

export const getByIdSchema = {
  params: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" }, // Enforces UUID format
    },
    required: ["id"],
  },
};
