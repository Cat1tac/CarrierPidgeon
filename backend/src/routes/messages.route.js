import express from "express";
import { getAllContacts, getMessageByUserId, sendMessage, getChatPartners } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// middlewares execute in order - requests first get rate-limited, then authenticated
// so unauthenticated requests get blocked before getting get by rate limited before hitting auth middleware
router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessageByUserId);
router.post("/send/:id", sendMessage);

export default router