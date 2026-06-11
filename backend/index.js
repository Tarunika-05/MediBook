require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");
const crypto = require("crypto");
const logger = require("./utils/logger");
const pool = require("./database/pool");
const migrate = require("./database/migrate");
const seed = require("./database/seed");
const { errorHandler } = require("./middleware/errorMiddleware");
const http = require("http");
const { initSocket } = require("./socket");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const slotRoutes = require("./routes/slotRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:5173"],
  credentials: true,
}));

const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));

// Structured logging middleware
app.use(pinoHttp({
  logger,
  genReqId: (req) => req.headers["x-request-id"] || crypto.randomUUID(),
  serializers: {
    req: (req) => ({ method: req.method, url: req.url, userId: req.raw?.user?.id }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
}));

// Tiered Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000, // relaxed for development testing
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 15 : 100, // relaxed for development testing
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many login/registration attempts" } },
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

app.get("/", (req, res) => {
  res.json({ message: "Smart Doctor Appointment API is running" });
});

const swaggerDocument = YAML.load(path.join(__dirname, "docs/swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "healthy", db: "connected", uptime: process.uptime() });
  } catch (err) {
    res.status(503).json({ status: "unhealthy", db: "disconnected" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let serverInstance;

async function waitForDatabase(retries = 15, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch {
      logger.info(`Waiting for database... (${i + 1}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Database connection failed after retries");
}

async function startServer() {
  try {
    await waitForDatabase();
    await migrate();

    if (process.env.SEED_DATA === "true") {
      await seed();
    }

    const server = http.createServer(app);
    initSocket(server);

    serverInstance = server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(error, "Failed to start server");
    process.exit(1);
  }
}

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  if (serverInstance) {
    serverInstance.close(() => {
      pool.end(() => {
        logger.info("Database pool closed. Server stopped.");
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
  setTimeout(() => process.exit(1), 10000); // Force exit after 10s
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

if (require.main === module) {
  startServer();
}

module.exports = app;
