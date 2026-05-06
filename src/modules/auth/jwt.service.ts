import config from "../../config";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../errors/errors";

export type JwtPayload = {
  id: string;
  login: string;
  displayedName: string;
  role: string;
};

export class JwtService {
  constructor() {}

  signAccess(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: "15m" });
  }

  signRefresh(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: "7d" });
  }

  verifyAccess(accessToken: string): JwtPayload {
    try {
      return jwt.verify(accessToken, config.jwt.accessSecret) as JwtPayload;
    } catch (e) {
      throw new UnauthorizedError("Token is invalid or expired");
    }
  }

  verifyRefresh(refreshToken: string): JwtPayload {
    try {
      return jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;
    } catch (e) {
      throw new UnauthorizedError("Refresh token is invalid or expired");
    }
  }

  decode(token: string): JwtPayload {
    return jwt.decode(token) as JwtPayload;
  }
}
