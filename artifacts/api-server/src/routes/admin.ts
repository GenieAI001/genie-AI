import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { checkAdminPassword, issueAdminToken } from "../lib/adminAuth";

const router: IRouter = Router();

const loginSchema = z.object({
  password: z.string().min(1),
});

router.post("/admin/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Password is required" });
    return;
  }

  if (!checkAdminPassword(parsed.data.password)) {
    res.status(401).json({ message: "Incorrect password" });
    return;
  }

  const token = issueAdminToken();
  res.json({ token });
});

export default router;
