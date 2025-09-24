require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const app = express();
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3000;

// Environment Validation
const requiredEnvVars = ["ACCESS_TOKEN_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingEnvVars.forEach((envVar) => {
    console.error(`   - ${envVar}`);
  });
  console.error("Please check your .env file and restart the server.");
  process.exit(1);
}

console.log("✅ All required environment variables are set.");

// უსაფრთხოების middleware
app.use(helmet());

// CORS კონფიგურაცია
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
      ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting - API-ის გამოყენების შეზღუდვა
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 წუთი
  max: 100, // მაქსიმუმ 100 request 15 წუთში
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusIcon = status >= 400 ? "❌" : status >= 300 ? "⚠️" : "✅";
    console.log(
      `${statusIcon} ${req.method} ${req.path} - ${status} - ${duration}ms`
    );
  });

  next();
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

const { pool } = require("./database");

// Get posts from database
async function getPosts() {
  try {
    const result = await pool.query(
      "SELECT username, title FROM posts ORDER BY created_at DESC"
    );
    return result.rows;
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    return [];
  }
}

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: მიიღე მომხმარებლის პოსტები
 *     description: JWT ტოკენით დაცული endpoint პოსტების მისაღებად
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: წარმატებით მიღებული პოსტები
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: ავტორიზაცია საჭიროა
 *       403:
 *         description: არასწორი ტოკენი
 */
app.get("/posts", authenticateToken, async (req, res) => {
  try {
    const posts = await getPosts();
    const userPosts = posts.filter((post) => post.username === req.user.name);
    res.json(userPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ error: "Token expired" });
        }
        return res.status(403).json({ error: "Invalid token" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
