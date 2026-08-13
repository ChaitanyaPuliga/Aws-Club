const express = require("express");
const cors = require("cors");
const chatRoutes = require("./modules/chat/chat.routes");
const usersRoutes = require("./modules/users/users.routes")
const documentsRoutes = require("./modules/documents/documents.routes");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.use(cors({
  origin(origin, callback) {
    // Allow local Vite development servers on any port. Production can be locked
    // to CLIENT_URL by setting it in the environment.
    const configuredOrigin = process.env.CLIENT_URL;
    const isLocalDevelopment = !origin || /^https?:\/\/localhost(:\d+)?$/.test(origin);
    if (!configuredOrigin || isLocalDevelopment || origin === configuredOrigin) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS"));
  },
}));
app.use(express.json());
app.use((req, res, next) => {
  if (req.path === "/api/users/me") console.log(`[profile-sync] ${req.method} ${req.path} auth=${Boolean(req.headers.authorization)}`);
  next();
});



app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Club Member Portal API is running",
  });
});


app.use("/api/chat", chatRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/documents", documentsRoutes);

app.use(notFound);
app.use(errorHandler);


module.exports = app;
