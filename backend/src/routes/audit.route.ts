import { Router } from "express";
import {
  getAuditLogs,
  restoreFromAuditLog,
  deleteAuditLog,
} from "../controllers/audit.controller";

const router = Router();

router.get("/", getAuditLogs);
router.post("/:id/restore", restoreFromAuditLog);
router.delete("/:id", deleteAuditLog);

export default router;
