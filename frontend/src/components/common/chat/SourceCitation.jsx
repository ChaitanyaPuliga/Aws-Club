export default function SourceCitation({
  sources = [],
}) {
  if (!sources.length) {
    return null;
  }

  return (
    <div className="chat-sources">
      <div className="chat-sources-title">
        Sources
      </div>

      {sources.map((source, index) => (
        <div
          className="chat-source"
          key={`${source.file}-${source.section || "document"}-${index}`}
        >
          <span className="chat-source-file">
            {source.file}
          </span>

          {source.section && (
            <span className="chat-source-section">
              Section: {source.section}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}