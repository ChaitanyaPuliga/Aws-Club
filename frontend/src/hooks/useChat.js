import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] =
    useState([]);
  const [conversationId, setConversationId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadConversations =
    useCallback(async () => {
      try {
        const data = await apiFetch(
          "/api/chat/conversations"
        );

        setConversations(
          Array.isArray(data.conversations)
            ? data.conversations
            : []
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load conversations."
        );
      }
    }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const selectConversation =
    useCallback(async (id) => {
      setConversationId(id);
      setError("");

      try {
        const data = await apiFetch(
          `/api/chat/conversations/${id}/messages`
        );

        const formatted =
          (data.messages || []).map(
            (message) => ({
              id: message.id,
              role: message.role,
              content: message.content,
              sources: [],
              fallback: false,
            })
          );

        setMessages(formatted);
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load conversation."
        );
      }
    }, []);

  const newChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setError("");
  }, []);

  const sendMessage = useCallback(
    async (content) => {
      const message = content.trim();

      if (!message || loading) {
        return;
      }

      setError("");
      setLoading(true);

      const temporaryId =
        `user-${Date.now()}`;

      setMessages((current) => [
        ...current,

        {
          id: temporaryId,
          role: "user",
          content: message,
          sources: [],
          fallback: false,
        },
      ]);

      try {
        const result =
          await apiFetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({
              message,
              conversationId,
            }),
          });

        if (result.conversation?.id) {
          setConversationId(
            result.conversation.id
          );
        }

        setMessages((current) => [
          ...current,

          {
            id:
              result.response?.id ||
              `assistant-${Date.now()}`,

            role: "assistant",

            content:
              result.answer ||
              result.response?.content ||
              "",

            sources:
              Array.isArray(result.sources)
                ? result.sources
                : [],

            fallback:
              Boolean(result.fallback),
          },
        ]);

        await loadConversations();
      } catch (err) {
        setError(
          err?.message ||
            "Unable to send your message."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      conversationId,
      loading,
      loadConversations,
    ]
  );

  return {
    messages,
    conversations,
    conversationId,
    loading,
    error,
    newChat,
    selectConversation,
    sendMessage,
  };
}