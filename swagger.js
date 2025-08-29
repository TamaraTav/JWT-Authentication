const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "JWT Authentication API",
      version: "1.0.0",
      description: "JWT ავტენტიფიკაციის სისტემა Node.js-ით და Express-ით",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Main Server (Posts API)",
      },
      {
        url: "http://localhost:4000",
        description: "Auth Server (Authentication API)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "Tamara",
            },
          },
        },
        Post: {
          type: "object",
          properties: {
            username: {
              type: "string",
              example: "Tamara",
            },
            title: {
              type: "string",
              example: "Post 1",
            },
          },
        },
        LoginRequest: {
          type: "object",
          properties: {
            username: {
              type: "string",
              minLength: 3,
              maxLength: 30,
              example: "Tamara",
            },
          },
          required: ["username"],
        },
        LoginResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        TokenRequest: {
          type: "object",
          properties: {
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
          required: ["token"],
        },
        TokenResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
      },
    },
  },
  apis: ["./server.js", "./authServer.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
