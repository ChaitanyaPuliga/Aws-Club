const express = require("express");
const chatController = require("./chat.controller");
const authMiddleware = require("../../middleware/auth");

const router = express.Router();

/*
 * Every chatbot endpoint requires authentication.
 */
router.use(authMiddleware);

/*
 * New stable chatbot API
 *
 * POST /api/chat
 */
router.post("/", chatController.chat);

/*
 * Existing conversation APIs
const PORT = process.env.PORT || 5000;
 */
router.post(
  "/conversations",
  chatController.createConversation
);

router.get(
  "/conversations",
  chatController.getConversations
);

router.post(
  "/ask",
  chatController.askQuestion
);

router.get(
  "/conversations/:id/messages",
  chatController.getMessages
);

router.post(
  "/conversations/:id/messages",
  chatController.addMessage
);

module.exports = router;