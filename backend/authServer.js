require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const Joi = require("joi");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const { dbOperations } = require("./database");

// Initialize database on startup
dbOperations.initDatabase().catch(console.error);
const app = express();
const jwt = require("jsonwebtoken");

const AUTH_PORT = process.env.AUTH_PORT || 4000;

// Environment Validation
const requiredEnvVars = ["ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET"];
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

// Rate Limiting - ავტენტიფიკაციის შეზღუდვა
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 წუთი
  max: 5, // მაქსიმუმ 5 login attempt 15 წუთში
  message: "Too many login attempts, please try again later.",
});
app.use("/login", authLimiter);

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

// Input Validation Schemas
const loginSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().trim(),
});

const tokenSchema = Joi.object({
  token: Joi.string().required().trim(),
});

// Validation Middleware
const validateLogin = (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Invalid input",
        details: error.details[0].message,
      });
    }
    next();
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const validateToken = (req, res, next) => {
  try {
    const { error } = tokenSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Invalid input",
        details: error.details[0].message,
      });
    }
    next();
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /token:
 *   post:
 *     summary: გაახლე access token
 *     description: refresh token-ით ახალი access token-ის მიღება
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenRequest'
 *     responses:
 *       200:
 *         description: წარმატებით განახლებული access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: refresh token არ არის მოწოდებული
 *       403:
 *         description: არასწორი refresh token
 */
app.post("/token", validateToken, async (req, res) => {
  try {
    const refreshToken = req.body.token;
    if (refreshToken == null) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    // Validate refresh token from database
    const username = await dbOperations.validateRefreshToken(refreshToken);
    if (!username) {
      return res
        .status(403)
        .json({ error: "Invalid or expired refresh token" });
    }

    const accessToken = generateAccessToken({ name: username });
    res.json({ accessToken: accessToken });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /logout:
 *   delete:
 *     summary: გამოსვლა
 *     description: refresh token-ის წაშლა და გამოსვლა
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenRequest'
 *     responses:
 *       204:
 *         description: წარმატებით გამოსული
 *       400:
 *         description: არასწორი მონაცემები
 */
app.delete("/logout", validateToken, async (req, res) => {
  try {
    const token = req.body.token;
    const revoked = await dbOperations.revokeRefreshToken(token);

    if (revoked) {
      res.sendStatus(204);
    } else {
      res.status(400).json({ error: "Token not found or already revoked" });
    }
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: ავტორიზაცია
 *     description: მომხმარებლის ავტორიზაცია და ტოკენების მიღება
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: წარმატებით ავტორიზებული
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: არასწორი მონაცემები
 */
app.post("/login", validateLogin, async (req, res) => {
  try {
    const username = req.body.username;
    const user = { name: username };

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

    // Store refresh token in database
    await dbOperations.addRefreshToken(refreshToken, username);

    res.json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function generateAccessToken(user) {
  try {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "30s",
    });
  } catch (error) {
    console.error("Token generation error:", error);
    throw error;
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

app.listen(AUTH_PORT, () => {
  console.log(`Auth server running on port ${AUTH_PORT}`);
});
