import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Import routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoriesRoutes from "./routes/categories.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/payments.js";
import { authenticateToken } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy setting - MUST be set before rate limiting
// This is required when deployed behind proxies (Vercel, AWS, etc.)
// Use environment variable to control this setting
const isProduction = process.env.NODE_ENV === "production";
app.set("trust proxy", isProduction ? 1 : false);

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Rate limiting - FIXED: Added trustProxy property
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  trustProxy: isProduction, // CRITICAL: This must match app.set('trust proxy') setting
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  // Optional: Store configuration for production (consider using Redis)
  // store: new RedisStore({ client: redisClient }),
  
  // Optional: Skip successful requests from count
  skipSuccessfulRequests: false,
  
  // Optional: Skip failed requests from count
  skipFailedRequests: false,
  
  // Key generator to identify clients
  keyGenerator: (req) => {
    // Use the IP address that Express provides (respects trust proxy setting)
    return req.ip;
  },
  
  // Handler for when rate limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests from this IP, please try again later.",
      retryAfter: Math.round(req.rateLimit?.resetTime / 1000) || 60,
    });
  },
});

// Apply general rate limiter to all routes
app.use(limiter);

// Create stricter rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 requests per windowMs for auth endpoints
  trustProxy: isProduction, // Must match app.set('trust proxy') setting
  skipSuccessfulRequests: false,
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many authentication attempts, please try again later.",
      retryAfter: Math.round(req.rateLimit?.resetTime / 1000) || 60,
    });
  },
});

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files (for uploaded images)
app.use("/uploads", express.static(join(__dirname, "uploads")));

// Request logging middleware (optional but useful for debugging)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// API routes with specific rate limiters where needed
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", authenticateToken, adminRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Perform cleanup operations here
  // Close database connections, save state, etc.
  
  setTimeout(() => {
    console.log("Graceful shutdown complete.");
    process.exit(0);
  }, 1000); // Give ongoing requests 1 second to complete
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Uncaught exception handler (last resort)
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Log the error but don't exit in development
  if (process.env.NODE_ENV === "production") {
    gracefulShutdown("UNCAUGHT_EXCEPTION");
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Log the error but don't exit in development
  if (process.env.NODE_ENV === "production") {
    gracefulShutdown("UNHANDLED_REJECTION");
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`
🚀 Goldmark Backend Server Running
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
🔒 Trust Proxy: ${app.get("trust proxy")}
📅 Started: ${new Date().toISOString()}
🔗 Health Check: http://localhost:${PORT}/health
  `);
});

// Export for testing purposes
export default app;
export { server };