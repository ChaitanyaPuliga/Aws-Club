const chatService = require("./chat.service");
const usersService = require("../users/users.service");

async function getProfile(req) {
  return usersService.getOrCreateProfile(
    req.user.id,
    req.user.name ||
      req.user.email ||
      null
  );
}

async function createConversation(
  req,
  res,
  next
) {
  try {
    const profile = await getProfile(req);

    const conversation =
      await chatService.createConversation(
        profile.id,
        req.body.title || null
      );

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
}

async function getConversations(
  req,
  res,
  next
) {
  try {
    const profile = await getProfile(req);

    const conversations =
      await chatService.getConversations(
        profile.id
      );

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
}

async function getMessages(
  req,
  res,
  next
) {
  try {
    const profile = await getProfile(req);

    const messages =
      await chatService.getMessages(
        req.params.id,
        profile.id
      );

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
}

async function addMessage(
  req,
  res,
  next
) {
  try {
    const {
      content,
      role,
    } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Message content is required",
      });
    }

    const profile = await getProfile(req);

    const message =
      await chatService.addMessage(
        req.params.id,
        profile.id,
        role === "assistant"
          ? "assistant"
          : "user",
        content.trim()
      );

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
}

/*
 * Existing endpoint.
 * Keeps your current Chat.jsx compatible.
 */
async function askQuestion(
  req,
  res,
  next
) {
  try {
    const content =
      req.body.content?.trim();

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "A question is required",
      });
    }

    const profile = await getProfile(req);

    const result =
      await chatService.askQuestion(
        profile.id,
        content,
        req.body.conversationId ||
          null
      );

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/*
 * Stable chatbot API.
 *
 * POST /api/chat
 *
 * Request:
 * {
 *   message: "When is the next workshop?"
 * }
 */
async function chat(
  req,
  res,
  next
) {
  try {
    const message =
      req.body.message?.trim();

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const profile = await getProfile(req);

    const result =
      await chatService.askQuestion(
        profile.id,
        message,
        req.body.conversationId ||
          null
      );

    res.json({
      success: true,

      answer: result.answer,

      sources: result.sources,

      fallback: result.fallback,

      conversation:
        result.conversation,

      question:
        result.question,

      response:
        result.response,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createConversation,
  getConversations,
  getMessages,
  addMessage,
  askQuestion,
  chat,
};