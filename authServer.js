require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const Joi = require("joi");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");

const AUTH_PORT = process.env.AUTH_PORT || 4000;

// უსაფრთხოების middleware
app.use(helmet());

// CORS კონფიგურაცია
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
        "http://localhost:3000",
        "http://localhost:3001",
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

let refreshTokens = [];

app.post("/token", validateToken, (req, res) => {
  try {
    const refreshToken = req.body.token;
    if (refreshToken == null) {
      return res.status(401).json({ error: "Refresh token required" });
    }
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ error: "Refresh token expired" });
        }
        return res.status(403).json({ error: "Invalid refresh token" });
      }
      const accessToken = generateAccessToken({ name: user.name });
      res.json({ accessToken: accessToken });
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/logout", validateToken, (req, res) => {
  try {
    const token = req.body.token;
    refreshTokens = refreshTokens.filter((t) => t !== token);
    res.sendStatus(204);
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", validateLogin, (req, res) => {
  try {
    const username = req.body.username;
    const user = { name: username };

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);

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
