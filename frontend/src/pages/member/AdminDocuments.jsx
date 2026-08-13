import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import MemberLayout from "../../components/common/MemberLayout";
import { apiFetch } from "../../lib/api";

const EMPTY_FORM = {
  title: "",
  fileName: "",
  description: "",
  content: "",
};

function documentToForm(document) {
  const chunks = Array.isArray(document?.chunks)
    ? [...document.chunks].sort(
        (a, b) => a.chunkIndex - b.chunkIndex
      )
    : [];

  const content = chunks
    .map((chunk, index) => {
      const sectionTitle = chunk.sectionTitle?.trim();

      if (!sectionTitle) {
        return chunk.content || "";
      }

      const heading = index === 0 ? "#" : "##";

      return `${heading} ${sectionTitle}\n\n${
        chunk.content || ""
      }`;
    })
    .join("\n\n")
    .trim();

  return {
    title: document?.title || "",
    fileName: document?.fileName || "",
    description: document?.description || "",
    content,
  };
}

export default function AdminDocuments() {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] =
    useState(true);

  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] =
    useState(true);

  const [form, setForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState(null);
  const [loadingDocument, setLoadingDocument] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProfile() {
    try {
      setProfileLoading(true);
      setError("");

      const data = await apiFetch("/api/users/me");

      setProfile(data.profile);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load your member profile."
      );
    } finally {
      setProfileLoading(false);
    }
  }

  async function loadDocuments() {
    try {
      setDocumentsLoading(true);

      const data =
        await apiFetch("/api/documents");

      setDocuments(
        Array.isArray(data?.documents)
          ? data.documents
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load documents."
      );
    } finally {
      setDocumentsLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    loadDocuments();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setSuccess("");
  }

  async function editDocument(id) {
    try {
      setLoadingDocument(true);
      setError("");
      setSuccess("");

      const data = await apiFetch(
        `/api/documents/${id}`
      );

      setForm(
        documentToForm(data?.document)
      );

      setEditingId(id);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load this document."
      );
    } finally {
      setLoadingDocument(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (!form.title.trim()) {
      setError("Document title is required.");
      return;
    }

    if (!form.fileName.trim()) {
      setError("Document filename is required.");
      return;
    }

    if (!form.content.trim()) {
      setError("Document content is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const endpoint = editingId
        ? `/api/documents/admin/${editingId}`
        : "/api/documents/admin/publish";

      const method = editingId
        ? "PUT"
        : "POST";

      const data = await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          title: form.title.trim(),
          fileName: form.fileName.trim(),
          description:
            form.description.trim(),
          content: form.content,
        }),
      });

      setSuccess(
        data?.message ||
          (editingId
            ? "Document updated and re-indexed successfully."
            : "Document published and indexed successfully.")
      );

      resetForm();

      await loadDocuments();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save the document."
      );
    } finally {
      setSaving(false);
    }
  }

  if (profileLoading) {
    return (
      <MemberLayout>
        <main className="content-page">
          <p className="documents-status">
            Checking administrator access...
          </p>
        </main>
      </MemberLayout>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role !== "ADMIN") {
    return (
      <MemberLayout>
        <main className="content-page">
          <p className="eyebrow">
            ADMINISTRATION
          </p>

          <h1>Access denied</h1>

          <p className="page-subtitle">
            You do not have administrator access
            to this page.
          </p>
        </main>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <main className="content-page admin-documents-page">
        <div className="admin-page-header">
          <div>
            <p className="eyebrow">
              ADMINISTRATION
            </p>

            <h1>
              Document Management
            </h1>

            <p className="page-subtitle">
              Publish or update official club
              documents. Publishing automatically
              rebuilds the searchable chunks.
            </p>
          </div>

          <button
            type="button"
            className="admin-secondary-button"
            onClick={resetForm}
            disabled={saving}
          >
            + New document
          </button>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-alert admin-alert-success">
            {success}
          </div>
        )}

        <section className="admin-document-editor">
          <div className="admin-card-header">
            <div>
              <p className="eyebrow">
                {editingId
                  ? "EDIT DOCUMENT"
                  : "NEW DOCUMENT"}
              </p>

              <h2>
                {editingId
                  ? "Update document"
                  : "Publish document"}
              </h2>
            </div>
          </div>

          <form
            className="admin-document-form"
            onSubmit={handleSubmit}
          >
            <div className="admin-form-grid">
              <label>
                <span>Document title</span>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Event Day Briefing"
                  disabled={saving}
                />
              </label>

              <label>
                <span>Filename</span>

                <input
                  type="text"
                  name="fileName"
                  value={form.fileName}
                  onChange={handleChange}
                  placeholder="event-day-briefing.md"
                  disabled={saving}
                />
              </label>
            </div>

            <label>
              <span>Description</span>

              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief description of this document"
                disabled={saving}
              />
            </label>

            <label>
              <span>Markdown content</span>

              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder={`# Event Day Briefing

## Judging

Judging starts at 2 PM.

## Room

Judging is in Room B.`}
                rows={18}
                disabled={saving}
              />
            </label>

            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-primary-button"
                disabled={saving}
              >
                {saving
                  ? "Publishing..."
                  : editingId
                  ? "Update & Re-index"
                  : "Publish & Index"}
              </button>

              <button
                type="button"
                className="admin-secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className="admin-document-list">
          <div className="admin-card-header">
            <div>
              <p className="eyebrow">
                DOCUMENT LIBRARY
              </p>

              <h2>
                Published documents
              </h2>
            </div>

            <span className="admin-count">
              {documents.length} documents
            </span>
          </div>

          {documentsLoading ? (
            <p className="documents-status">
              Loading documents...
            </p>
          ) : documents.length === 0 ? (
            <p className="documents-status">
              No documents found.
            </p>
          ) : (
            <div className="admin-document-table-wrap">
              <table className="admin-document-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Filename</th>
                    <th>Status</th>
                    <th>Chunks</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td>
                        <strong>
                          {document.title}
                        </strong>
                      </td>

                      <td>
                        {document.fileName}
                      </td>

                      <td>
                        <span className="admin-status-badge">
                          {document.status}
                        </span>
                      </td>

                      <td>
                        {document._count?.chunks ??
                          0}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-edit-button"
                          onClick={() =>
                            editDocument(
                              document.id
                            )
                          }
                          disabled={
                            loadingDocument ||
                            saving
                          }
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </MemberLayout>
  );
}