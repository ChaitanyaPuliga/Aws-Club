import { useEffect, useState } from "react";
import MemberLayout from "../../components/common/MemberLayout";
import { apiFetch } from "../../lib/api";

function cleanPreview(text = "") {
  return text
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*/g, "")
    .trim();
}

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingDocument, setLoadingDocument] =
    useState(false);

  const [error, setError] = useState("");
  const [documentError, setDocumentError] =
    useState("");

  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch("/api/documents");

        setDocuments(
          Array.isArray(data?.documents)
            ? data.documents
            : []
        );
      } catch (error) {
        setError(
          error?.message ||
            "Unable to load documents."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, []);

  async function openDocument(documentId) {
    try {
      setLoadingDocument(true);
      setDocumentError("");

      const data = await apiFetch(
        `/api/documents/${documentId}`
      );

      setSelectedDocument(data.document);
    } catch (error) {
      setDocumentError(
        error?.message ||
          "Unable to open document."
      );
    } finally {
      setLoadingDocument(false);
    }
  }

  function closeDocument() {
    setSelectedDocument(null);
    setDocumentError("");
  }

  return (
    <MemberLayout>
      <main className="content-page">
        {!selectedDocument ? (
          <>
            <p className="eyebrow">
              CLUB KNOWLEDGE BASE
            </p>

            <h1>Documents</h1>

            <p className="page-subtitle">
              The verified source material used by the
              Club Assistant.
            </p>

            {loading && (
              <p className="documents-status">
                Loading document library...
              </p>
            )}

            {error && (
              <p className="form-error">
                {error}
              </p>
            )}

            {!loading &&
              !error &&
              documents.length === 0 && (
                <p className="documents-status">
                  No documents available.
                </p>
              )}

            <div className="document-grid">
              {documents.map((document) => (
                <button
                  key={document.id}
                  type="button"
                  className="document-card"
                  onClick={() =>
                    openDocument(document.id)
                  }
                >
                  <span className="document-icon">
                    ▤
                  </span>

                  <h2>{document.title}</h2>

                  <p>
                    {cleanPreview(
                      document.description ||
                        "No description available."
                    )}
                  </p>

                  <footer>
                    {document.fileName}
                    {" · "}
                    {document._count?.chunks ?? 0}
                    {" sections"}
                  </footer>

                  <span className="document-open-text">
                    Open document →
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <section className="document-reader">
            <button
              type="button"
              className="document-back-button"
              onClick={closeDocument}
            >
              ← Back to Documents
            </button>

            <div className="document-reader-header">
              <p className="eyebrow">
                CLUB KNOWLEDGE BASE
              </p>

              <h1>
                {selectedDocument.title}
              </h1>

              <p className="document-reader-file">
                {selectedDocument.fileName}
              </p>
            </div>

            {documentError && (
              <p className="form-error">
                {documentError}
              </p>
            )}

            {loadingDocument ? (
              <p className="documents-status">
                Loading document...
              </p>
            ) : (
              <article className="document-reader-content">
                {selectedDocument.chunks?.map(
                  (chunk) => (
                    <section
                      className="document-section"
                      key={chunk.id}
                    >
                      {chunk.sectionTitle && (
                        <h2>
                          {chunk.sectionTitle}
                        </h2>
                      )}

                      <div className="document-chunk">
                        {chunk.content}
                      </div>
                    </section>
                  )
                )}
              </article>
            )}
          </section>
        )}
      </main>
    </MemberLayout>
  );
}