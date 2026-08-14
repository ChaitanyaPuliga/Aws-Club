const prisma =
  require("../config/db");

const ai =
  require("../config/ai");

const TOP_K = Number(
  process.env.RAG_TOP_K || "3"
);

const MIN_SCORE = Number(
  process.env.RAG_MIN_SCORE || "0.35"
);

function vectorToString(vector) {
  if (!Array.isArray(vector) || !vector.length) {
    throw new Error(
      "Invalid embedding vector."
    );
  }

  return `[${vector.join(",")}]`;
}

/**
 * Semantic vector search using pgvector.
 */
async function searchDocuments(question) {
  const queryEmbedding =
    await ai.embedQuery(question);

  const vector =
    vectorToString(queryEmbedding);

  const rows =
    await prisma.$queryRaw`
      SELECT
        dc.id,
        dc.content,
        dc."sectionTitle",
        dc."chunkIndex",

        d.id AS "documentId",
        d.title AS "documentTitle",
        d."fileName" AS "fileName",

        1 - (
          dc.embedding <=> ${vector}::vector
        ) AS score

      FROM "document_chunks" dc

      INNER JOIN "documents" d
        ON d.id = dc."documentId"

      WHERE
        d.status = 'ACTIVE'
        AND dc.embedding IS NOT NULL

      ORDER BY
        dc.embedding <=> ${vector}::vector

      LIMIT ${TOP_K}
    `;

  return rows
    .map((row) => ({
      id: row.id,

      content: row.content,

      sectionTitle:
        row.sectionTitle,

      chunkIndex:
        Number(row.chunkIndex),

      document: {
        id: row.documentId,
        title: row.documentTitle,
        fileName: row.fileName,
      },

      score: Number(row.score),
    }))
    .filter(
      (chunk) =>
        chunk.score >= MIN_SCORE
    );
}

module.exports = {
  searchDocuments,
};