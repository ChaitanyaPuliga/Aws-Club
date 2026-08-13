require("dotenv").config();
const fs = require("fs");
const path = require("path");
const prisma = require("../src/config/db");

function makeDescription(content) {
  return content.replace(/^#.*$/m, "").replace(/\s+/g, " ").trim().slice(0, 180);
}

function chunks(content) {
  const sections = content.split(/(?=^#{1,3}\s+)/m).filter(Boolean);
  return (sections.length ? sections : [content]).map((part, chunkIndex) => {
    const [heading, ...body] = part.trim().split("\n");
    return { chunkIndex, sectionTitle: heading.replace(/^#+\s*/, "") || null, content: body.join("\n").trim() || part.trim() };
  });
}

async function seedStarterPack() {
  const directory = path.join(__dirname, "..", "documents");
  const files = fs.readdirSync(directory).filter((file) => file.endsWith(".md")).sort();
  for (const fileName of files) {
    const content = fs.readFileSync(path.join(directory, fileName), "utf8");
    const title = (content.match(/^#\s+(.+)$/m) || [null, fileName.replace(/^\d+-|\.md$/g, "").replace(/-/g, " ")])[1];
    const document = await prisma.document.upsert({
      where: { fileName },
      update: { title, description: makeDescription(content), status: "ACTIVE" },
      create: { title, fileName, description: makeDescription(content) },
    });
    await prisma.documentChunk.deleteMany({ where: { documentId: document.id } });
    await prisma.documentChunk.createMany({
      data: chunks(content).map((chunk) => ({ ...chunk, documentId: document.id })),
      // Multiple Nodemon/server processes can start at the same time locally.
      // The unique documentId/chunkIndex key makes duplicate inserts harmless.
      skipDuplicates: true,
    });
  }
  console.log(`Seeded ${files.length} club documents for Prisma Studio.`);
}

if (require.main === module) {
  seedStarterPack().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
}

module.exports = { seedStarterPack };
