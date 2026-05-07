import { Role } from "../../entities/user.entity";

export interface CreateUserData {
  role: Role;
  login: string;
  email: string;
  phoneNumber: string;
  password: string;
  name: string;
}

export interface UpdateUserData {
  id: string;
  role?: Role;
  login?: string;
  email?: string;
  phoneNumber?: string;
  name?: string;
  surname?: string;
  displayedName?: string;
  companyName?: string;
  companyLink?: string;
  socialLinkedIn?: string;
  socialX?: string;
  socialGitHub?: string;
  portfolioLinks?: string[];
  bio?: string;
  avgHourlyRate?: number;
}

export interface BaseUpdate {
  login?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  name?: string;
  surname?: string;
  displayedName?: string;
}

export interface ClientUpdate extends BaseUpdate {
  companyName?: string;
  companyLink?: string;
}

export interface DeveloperUpdate extends BaseUpdate {
  socialLinkedIn?: string;
  socialX?: string;
  socialGitHub?: string;
  portfolioLinks?: string[];
  bio?: string;
  avgHourlyRate?: number;
}

export interface LoginData {
  login: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface RefreshTokenData {
  oldRefreshToken: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}
