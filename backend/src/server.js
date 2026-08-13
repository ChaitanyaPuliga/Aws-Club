require("dotenv").config();

const app = require("./app");
const { seedStarterPack } = require("../prisma/seed");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    await seedStarterPack();
  } catch (error) {
    // Seeding is safe to retry and must never take down the API process.
    console.error("Starter-pack seed skipped:", error.message);
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other backend process or set PORT to a free port.`);
  } else {
    console.error("API server error:", error);
  }
  process.exitCode = 1;
});
