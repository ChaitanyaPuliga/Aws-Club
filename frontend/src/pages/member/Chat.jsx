import MemberLayout from "../../components/common/MemberLayout";
import useChat from "../../hooks/useChat";

import ChatWindow from "../../components/common/chat/ChatWindow";
import ChatInput from "../../components/common/chat/ChatInput";

import "../../styles/chat.css";

export default function Chat() {
  const {
    messages,
    conversations,
    conversationId,
    loading,
    error,
    newChat,
    selectConversation,
    sendMessage,
  } = useChat();

  return (
    <MemberLayout>
      <main className="chat-page">
        <aside className="conversation-list">
          <button
            type="button"
            className="new-chat"
            onClick={newChat}
          >
            + New chat
          </button>

          <h2>
            Recent chats
          </h2>

          {conversations.map(
            (conversation) => (
              <button
                type="button"
                key={conversation.id}
                onClick={() =>
                  selectConversation(
                    conversation.id
                  )
                }
                className={
                  conversation.id ===
                  conversationId
                    ? "selected"
                    : ""
                }
              >
                {conversation.title ||
                  "Untitled conversation"}
              </button>
            )
          )}
        </aside>

        <section className="chat-panel">
          <div className="chat-intro">
            <span className="bot-orb">
              ✦
            </span>

            <div>
              <h1>
                Chat with Club Assistant
              </h1>

              <p>
                Ask questions using the
                official club documents.
              </p>
            </div>
          </div>

          {error && (
            <p className="chat-error">
              {error}
            </p>
          )}

          <ChatWindow
            messages={messages}
            loading={loading}
          />

          <ChatInput
            onSend={sendMessage}
            loading={loading}
          />

          <p className="chat-note">
            Answers are grounded in the
            official club documents.
          </p>
        </section>
      </main>
    </MemberLayout>
  );
}