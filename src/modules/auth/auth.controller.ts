import { AuthService, LoginTokens } from "./auth.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserData } from "../user/user.types";
// @ts-ignore
import cookie from "@fastify/cookie";
import { SafeUser } from "./auth.route";
import config from "../../config";
import { UnauthorizedError } from "../../errors/errors";
import { LoginData } from "./auth.types";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (
    req: FastifyRequest<{ Body: CreateUserData }>,
    res: FastifyReply,
  ): Promise<SafeUser> => {
    const safeUser = await this.authService.toSafeUser(
      await this.authService.register(req.body),
    );

    return res.status(201).send(safeUser);
  };

  login = async (
    req: FastifyRequest<{ Body: LoginData }>,
    res: FastifyReply,
  ): Promise<LoginTokens> => {
    const tokens = await this.authService.login({
      login: req.body.login,
      password: req.body.password,
      ipAddress: req.ip ? req.ip : null,
      userAgent: req.headers["user-agent"] ? req.headers["user-agent"] : null,
    });

    this.setAuthCookies(res, tokens);

    return res.status(200).send({ user: tokens.user });
  };

  refresh = async (
    req: FastifyRequest<{ Body: { refreshToken: string } }>,
    res: FastifyReply,
  ): Promise<LoginTokens> => {
    const oldRefreshToken = req.cookies["refresh_token"];

    if (!oldRefreshToken) throw new UnauthorizedError("No refresh token");

    const tokens = await this.authService.refresh({
      oldRefreshToken,
      ipAddress: req.ip ? req.ip : null,
      userAgent: req.headers["user-agent"] ? req.headers["user-agent"] : null,
    });

    this.setAuthCookies(res, tokens);
    return res.status(200).send({ user: tokens.user });
  };

  logout = async (req: FastifyRequest, res: FastifyReply) => {
    const refreshToken = req.cookies["refresh_token"];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    const isProd = config.node_env === "production";

    const cookieOptions = {
      path: "/",
      ...(isProd ? { domain: ".ryban.ru" } : {}),
    };

    return res
      .clearCookie("access_token", cookieOptions)
      .clearCookie("refresh_token", cookieOptions)
      .status(200)
      .send({ success: true });
  };

  private setAuthCookies(res: FastifyReply, tokens: LoginTokens) {
    const isProd = config.node_env === "production";

    // Базовые настройки для любой среды
    const baseOptions = {
      path: "/",
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    };

    // Динамически собираем финальные объекты, чтобы избежать передачи undefined
    const accessCookieOptions = {
      ...baseOptions,
      maxAge: 900,
      ...(isProd ? { domain: ".ryban.ru" } : {}),
    };

    const refreshCookieOptions = {
      ...baseOptions,
      maxAge: 604800, // 7 days
      ...(isProd ? { domain: ".ryban.ru" } : {}),
    };

    res.setCookie("access_token", tokens.accessToken, accessCookieOptions);
    res.setCookie("refresh_token", tokens.refreshToken, refreshCookieOptions);
  }
}
