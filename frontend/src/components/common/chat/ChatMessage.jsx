import SourceCitation from "./SourceCitation";

export default function ChatMessage({
  message,
}) {
  const isAssistant =
    message.role === "assistant";

  return (
    <article
      className={`chat-message ${
        isAssistant
          ? "assistant"
          : "user"
      }`}
    >
      <div className="chat-message-role">
        {isAssistant
          ? "Club Assistant"
          : "You"}
      </div>

      <div className="chat-message-content">
        {message.content}
      </div>

      {isAssistant &&
        message.fallback && (
          <div className="chat-fallback-label">
            No matching club document found
          </div>
        )}

      {isAssistant && (
        <SourceCitation
          sources={message.sources}
        />
      )}
    </article>
  );
}