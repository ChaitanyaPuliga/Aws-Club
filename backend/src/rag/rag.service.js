const prisma = require("../config/db");

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "is",
  "are",
  "was",
  "were",
  "be",
  "to",
  "of",
  "for",
  "in",
  "on",
  "at",
  "by",
  "with",
  "from",
  "how",
  "what",
  "when",
  "where",
  "why",
  "who",
  "which",
  "do",
  "does",
  "did",
  "can",
  "could",
  "would",
  "should",
  "i",
  "me",
  "my",
  "you",
  "your",
  "we",
  "our",
  "it",
  "this",
  "that",
  "tell",
  "about",
]);

function tokenize(value = "") {
  return [
    ...new Set(
      String(value)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(
          (word) =>
            word.length >= 3 &&
            !STOP_WORDS.has(word)
        )
    ),
  ];
}

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateScore(question, chunk) {
  const questionTerms = tokenize(question);

  if (!questionTerms.length) {
    return 0;
  }

  const sectionText = normalize(
    chunk.sectionTitle || ""
  );

  const documentText = normalize(
    chunk.document?.title || ""
  );

  const contentText = normalize(
    chunk.content || ""
  );

  let matched = 0;
  let weightedMatches = 0;

  for (const term of questionTerms) {
    const inSection = sectionText.includes(term);
    const inTitle = documentText.includes(term);
    const inContent = contentText.includes(term);

    if (inSection || inTitle || inContent) {
      matched += 1;

      if (inSection) {
        weightedMatches += 1.5;
      } else if (inTitle) {
        weightedMatches += 1.25;
      } else {
        weightedMatches += 1;
      }
    }
  }

  const baseScore = matched / questionTerms.length;

  const weightedScore =
    weightedMatches /
    (questionTerms.length * 1.5);

  const exactPhraseBonus =
    contentText.includes(normalize(question))
      ? 0.15
      : 0;

  return Math.min(
    1,
    baseScore * 0.65 +
      weightedScore * 0.2 +
      exactPhraseBonus
  );
}

async function searchDocuments(question) {
  const minScore = Number(
    process.env.RAG_MIN_SCORE || "0.35"
  );

  const chunks = await prisma.documentChunk.findMany({
    where: {
      document: {
        status: "ACTIVE",
      },
    },
    include: {
      document: {
        select: {
          id: true,
          title: true,
          fileName: true,
        },
      },
    },
  });

  return chunks
    .map((chunk) => ({
      id: chunk.id,
      content: chunk.content,
      sectionTitle: chunk.sectionTitle,
      chunkIndex: chunk.chunkIndex,
      document: chunk.document,
      score: calculateScore(question, chunk),
    }))
    .filter((chunk) => chunk.score >= minScore)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, 3);
}

module.exports = {
  searchDocuments,
};