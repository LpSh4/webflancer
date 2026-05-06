import { Role } from "../../entities/user.entity";

export interface CreateUserData {
  role: Role;
  login: string;
  email: string;
  phoneNumber: string;
  password: string;
  name: string;
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
