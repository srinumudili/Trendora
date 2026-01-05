import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

export const configureCORS = () => {
  const allowedOrigins = ["http://localhost:3000", "http://localhost:4000"];

  return cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
};

export const configureHelmet = () => {
  // return helmet({
  //   contentSecurityPolicy: {
  //     directives: {
  //       defaultSrc: ["'self'"],
  //       styleSrc: ["'self'", "'unsafe-inline'"],
  //       scriptSrc: ["'self'"],
  //       imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
  //     },
  //   },
  //   crossOriginEmbedderPolicy: false,
  // });

  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://embeddable-sandbox.cdn.apollographql.com",
        ],

        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],

        imgSrc: [
          "'self'",
          "data:",
          "https://apollo-server-landing-page.cdn.apollographql.com",
        ],

        fontSrc: ["'self'", "https://fonts.gstatic.com"],

        frameSrc: ["'self'", "https://sandbox.embed.apollographql.com"],

        connectSrc: [
          "'self'",
          "https://embeddable-sandbox.cdn.apollographql.com",
        ],

        manifestSrc: [
          "https://apollo-server-landing-page.cdn.apollographql.com",
        ],
      },
    },
  });
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const configureMongoSanitize = () => {
  return mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized prohibited character in key: ${key}`);
    },
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: "Validation Error",
      details: errors,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      error: `Duplicate value for field: ${field}`,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
    });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || "Internal Server Error",
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
};
