import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const API_TOKEN_TTL = "60d";

const getSecretKey = () => {
  const secret = process.env.API_JWT_SECRET;
  if (!secret) {
    throw new Error("API_JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
};

export const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const verifyPassword = (password: string, passwordHash: string) =>
  bcrypt.compare(password, passwordHash);

export const mintApiToken = async (userId: string) =>
  new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(API_TOKEN_TTL)
    .sign(getSecretKey());

export const verifyApiToken = async (token: string): Promise<{ userId: string }> => {
  const { payload } = await jwtVerify(token, getSecretKey());
  if (typeof payload.sub !== "string") {
    throw new Error("Invalid token payload");
  }
  return { userId: payload.sub };
};
