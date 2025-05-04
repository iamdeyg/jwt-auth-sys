import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "./asyncHandler";

const prisma = new PrismaClient();

const privateKey = process.env.PRIVATE_KEY!.replace(/\\n/g, "\n");
const privateKeyKid = process.env.PRIVATE_KEY_KID!;

export const signToken = async (payload: object): Promise<string> => {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "1h",
    header: {
      alg: "RS256",
      kid: privateKeyKid,
    },
  });
};

export const verifyTokenMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  const decodedHeader = jwt.decode(token, { complete: true }) as any;
  const kid = decodedHeader?.header?.kid;

  const storedKey = await prisma.publicKey.findUnique({ where: { kid } });
  if (!storedKey || storedKey.status !== "ACTIVE") {
    return res.status(401).json({ message: "Invalid key" });
  }

  try {
    const publicKey = storedKey.publicKey.replace(/\\n/g, "\n");
    const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
});
