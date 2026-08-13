const AI_PROVIDER =
  process.env.AI_PROVIDER || "local";

function cleanContent(content = "") {
  return String(content).trim();
}

async function generateLocalAnswer(
  question,
  context
) {
  if (!context?.length) {
    return "";
  }

  const best = context[0];

  const section = best.sectionTitle
    ? ` (${best.sectionTitle})`
    : "";

  const content = cleanContent(
    best.content
  );

  return `According to the official club documentation${section}:

${content}`;
}

async function generateAnswer(
  question,
  context
) {
  switch (AI_PROVIDER) {
    case "local":
      return generateLocalAnswer(
        question,
        context
      );

    case "bedrock":
      throw new Error(
        "Bedrock provider is not configured yet."
      );

    default:
      throw new Error(
        `Unsupported AI_PROVIDER: ${AI_PROVIDER}`
      );
  }
}

module.exports = {
  generateAnswer,
};