import type { Request, Response, NextFunction } from "express";
import { verifyAdminToken } from "../lib/adminAuth";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token || !verifyAdminToken(token)) {
    res.status(401).json({ message: "Unauthorized: admin login required" });
    return;
  }

  next();
}
