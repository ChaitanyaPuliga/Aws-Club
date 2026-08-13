const prisma = require("../../config/db");

/**
 * Create a short description from the document content.
 */
function makeDescription(content = "") {
  return String(content)
    .replace(/^#.*$/m, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

/**
 * Convert Markdown into logical searchable chunks.
 *
 * We follow the same approach already used by prisma/seed.js:
 * headings #, ## and ### start new chunks.
 */
function chunkMarkdown(content = "") {
  const normalized = String(content).replace(/\r\n/g, "\n");

  const sections = normalized
    .split(/(?=^#{1,3}\s+)/m)
    .map((part) => part.trim())
    .filter(Boolean);

  const parts = sections.length
    ? sections
    : [normalized.trim()].filter(Boolean);

  return parts.map((part, chunkIndex) => {
    const lines = part.split("\n");

    const heading = lines[0]?.trim() || "";

    const sectionTitle =
      /^#{1,3}\s+/.test(heading)
        ? heading.replace(/^#{1,3}\s+/, "").trim()
        : null;

    const body = lines.slice(1).join("\n").trim();

    return {
      chunkIndex,
      sectionTitle,
      content: body || part,
    };
  });
}

/**
 * List active documents for members.
 */
async function listDocuments() {
  return prisma.document.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      title: "asc",
    },
    include: {
      _count: {
        select: {
          chunks: true,
        },
      },
    },
  });
}

/**
 * Get a complete document with its chunks.
 */
async function getDocument(id) {
  return prisma.document.findFirst({
    where: {
      id,
      status: "ACTIVE",
    },
    include: {
      chunks: {
        orderBy: {
          chunkIndex: "asc",
        },
      },
    },
  });
}

/**
 * Publish a new document.
 *
 * This creates:
 *
 * Document
 *   └── DocumentChunk[]
 *
 * inside one database transaction.
 */
async function publishDocument({
  title,
  fileName,
  description,
  content,
}) {
  if (!title?.trim()) {
    const error = new Error(
      "Document title is required"
    );
    error.status = 400;
    throw error;
  }

  if (!fileName?.trim()) {
    const error = new Error(
      "Document filename is required"
    );
    error.status = 400;
    throw error;
  }

  if (!content?.trim()) {
    const error = new Error(
      "Document content is required"
    );
    error.status = 400;
    throw error;
  }

  const cleanTitle = title.trim();
  const cleanFileName = fileName.trim();
  const cleanContent = content.trim();

  const chunks = chunkMarkdown(cleanContent);

  if (!chunks.length) {
    const error = new Error(
      "Document produced no searchable chunks"
    );
    error.status = 400;
    throw error;
  }

  const finalDescription =
    description?.trim() ||
    makeDescription(cleanContent);

  return prisma.$transaction(async (tx) => {
    /*
     * fileName is UNIQUE in your Prisma schema.
     *
     * Therefore publishing the same filename updates
     * the existing document instead of creating a duplicate.
     */
    const existing =
      await tx.document.findUnique({
        where: {
          fileName: cleanFileName,
        },
        select: {
          id: true,
        },
      });

    let document;

    if (existing) {
      document =
        await tx.document.update({
          where: {
            id: existing.id,
          },
          data: {
            title: cleanTitle,
            description: finalDescription,
            status: "ACTIVE",
          },
        });

      /*
       * Re-index:
       * remove the old chunks first.
       */
      await tx.documentChunk.deleteMany({
        where: {
          documentId: document.id,
        },
      });
    } else {
      document =
        await tx.document.create({
          data: {
            title: cleanTitle,
            fileName: cleanFileName,
            description: finalDescription,
            status: "ACTIVE",
          },
        });
    }

    /*
     * Create the new searchable chunks.
     */
    await tx.documentChunk.createMany({
      data: chunks.map((chunk) => ({
        documentId: document.id,
        chunkIndex: chunk.chunkIndex,
        sectionTitle: chunk.sectionTitle,
        content: chunk.content,
      })),
    });

    /*
     * Return the newly indexed document.
     */
    return tx.document.findUnique({
      where: {
        id: document.id,
      },
      include: {
        _count: {
          select: {
            chunks: true,
          },
        },
        chunks: {
          orderBy: {
            chunkIndex: "asc",
          },
        },
      },
    });
  });
}

/**
 * Explicit update by document id.
 *
 * This is useful for the admin edit screen.
 */
async function updateDocument(
  id,
  {
    title,
    fileName,
    description,
    content,
  }
) {
  if (!id) {
    const error = new Error(
      "Document id is required"
    );
    error.status = 400;
    throw error;
  }

  if (!title?.trim()) {
    const error = new Error(
      "Document title is required"
    );
    error.status = 400;
    throw error;
  }

  if (!fileName?.trim()) {
    const error = new Error(
      "Document filename is required"
    );
    error.status = 400;
    throw error;
  }

  if (!content?.trim()) {
    const error = new Error(
      "Document content is required"
    );
    error.status = 400;
    throw error;
  }

  const cleanTitle = title.trim();
  const cleanFileName = fileName.trim();
  const cleanContent = content.trim();

  const chunks = chunkMarkdown(cleanContent);

  return prisma.$transaction(async (tx) => {
    const existing =
      await tx.document.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      const error = new Error(
        "Document not found"
      );
      error.status = 404;
      throw error;
    }

    /*
     * Because fileName is UNIQUE, prevent an update
     * from stealing another document's filename.
     */
    const filenameOwner =
      await tx.document.findFirst({
        where: {
          fileName: cleanFileName,
          NOT: {
            id,
          },
        },
        select: {
          id: true,
        },
      });

    if (filenameOwner) {
      const error = new Error(
        "Another document already uses that filename"
      );
      error.status = 409;
      throw error;
    }

    const document =
      await tx.document.update({
        where: {
          id,
        },
        data: {
          title: cleanTitle,
          fileName: cleanFileName,
          description:
            description?.trim() ||
            makeDescription(cleanContent),
          status: "ACTIVE",
        },
      });

    /*
     * Re-index the document.
     */
    await tx.documentChunk.deleteMany({
      where: {
        documentId: id,
      },
    });

    await tx.documentChunk.createMany({
      data: chunks.map((chunk) => ({
        documentId: id,
        chunkIndex: chunk.chunkIndex,
        sectionTitle: chunk.sectionTitle,
        content: chunk.content,
      })),
    });

    return tx.document.findUnique({
      where: {
        id: document.id,
      },
      include: {
        _count: {
          select: {
            chunks: true,
          },
        },
        chunks: {
          orderBy: {
            chunkIndex: "asc",
          },
        },
      },
    });
  });
}

module.exports = {
  listDocuments,
  getDocument,
  chunkMarkdown,
  publishDocument,
  updateDocument,
};