import {
  useState,
} from "react";

export default function ChatInput({
  onSend,
  loading,
}) {
  const [value, setValue] =
    useState("");

  function submit(event) {
    event.preventDefault();

    const message =
      value.trim();

    if (!message || loading) {
      return;
    }

    onSend(message);
    setValue("");
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      submit(event);
    }
  }

  return (
    <form
      className="chat-input-form"
      onSubmit={submit}
    >
      <textarea
        value={value}
        onChange={(event) =>
          setValue(event.target.value)
        }
        onKeyDown={handleKeyDown}
        placeholder="Ask about the AWS Student Builder Group..."
        rows={2}
        disabled={loading}
      />

      <button
        type="submit"
        disabled={
          loading ||
          !value.trim()
        }
      >
        {loading
          ? "..."
          : "Send"}
      </button>
    </form>
  );
}