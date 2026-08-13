import {
  useEffect,
  useRef,
} from "react";

import ChatMessage from "./ChatMessage";

export default function ChatWindow({
  messages,
  loading,
}) {
  const bottomRef =
    useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <div className="chat-empty">
          <div className="chat-empty-icon">
            ✦
          </div>

          <h2>
            How can I help today?
          </h2>

          <p>
            Ask about AWS workshops,
            Builder Center, club rules,
            account setup, or other
            official club information.
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
          />
        ))
      )}

      {loading && (
        <div className="chat-message assistant">
          <div className="chat-message-role">
            Club Assistant
          </div>

          <div className="chat-thinking">
            Searching official club
            documents...
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}