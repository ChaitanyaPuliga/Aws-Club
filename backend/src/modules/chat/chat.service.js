const prisma = require("../../config/db");
const ragService = require("../../rag/rag.service");
const ai = require("../../config/ai");

const FALLBACK_MESSAGE =
  "I could not find that information in the club documents. Please contact the campus AWS Student Builder contact for assistance.";

async function createConversation(
  userId,
  title = null
) {
  return prisma.conversation.create({
    data: {
      userId,
      title,
    },
  });
}

async function getConversations(userId) {
  return prisma.conversation.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

async function getMessages(
  conversationId,
  userId
) {
  return prisma.message.findMany({
    where: {
      conversationId,
      conversation: {
        userId,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

async function addMessage(
  conversationId,
  userId,
  role,
  content
) {
  const conversation =
    await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      select: {
        id: true,
      },
    });

  if (!conversation) {
    const error = new Error(
      "Conversation not found"
    );

    error.status = 404;
    throw error;
  }

  return prisma.message.create({
    data: {
      conversationId,
      role,
      content,
    },
  });
}

async function askQuestion(
  userId,
  content,
  conversationId = null
) {
  let conversation;

  /*
   * Existing conversation
   */
  if (conversationId) {
    conversation =
      await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

    if (!conversation) {
      const error = new Error(
        "Conversation not found"
      );

      error.status = 404;
      throw error;
    }
  }

  /*
   * New conversation
   */
  if (!conversation) {
    conversation =
      await createConversation(
        userId,
        content.slice(0, 80)
      );
  }

  /*
   * RAG retrieval
   */
  const relevantChunks =
    await ragService.searchDocuments(
      content
    );

  let answer;
  let fallback = false;
  let sources = [];

  /*
   * Weak / empty retrieval
   */
  if (!relevantChunks.length) {
    answer = FALLBACK_MESSAGE;
    fallback = true;
  } else {
    /*
     * Local AI provider
     */
    answer = await ai.generateAnswer(
      content,
      relevantChunks
    );

    sources =
      relevantChunks.map((chunk) => ({
        file: chunk.document.fileName,
        section:
          chunk.sectionTitle || null,
      }));
  }

  /*
   * Persist the conversation
   */
  const [questionMessage, responseMessage] =
    await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId:
            conversation.id,
          role: "user",
          content,
        },
      }),

      prisma.message.create({
        data: {
          conversationId:
            conversation.id,
          role: "assistant",
          content: answer,
        },
      }),

      prisma.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          updatedAt: new Date(),
        },
      }),
    ]);

  return {
    conversation,

    question: questionMessage,

    response: responseMessage,

    answer,

    sources,

    fallback,
  };
}

module.exports = {
  createConversation,
  getConversations,
  getMessages,
  addMessage,
  askQuestion,
};