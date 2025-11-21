import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import typeDefs from "./graphql/typeDefs/index.js";
import resolvers from "./graphql/resolvers/index.js";
import context from "./graphql/context.js";
import {
  configureCORS,
  configureHelmet,
  apiLimiter,
  configureMongoSanitize,
  errorHandler,
  notFound,
} from "./middleware/security.js";

dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Security Middleware
app.use(configureHelmet());
app.use(configureCORS());
app.use(configureMongoSanitize());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/graphql", apiLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Trendora API is running",
    timestamp: new Date().toISOString(),
  });
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error("GraphQL Error:", error);
    return {
      message: error.message,
      locations: error.locations,
      path: error.path,
    };
  },
  introspection: process.env.NODE_ENV !== "production", // Disable in production
});

await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => context({ req }),
  })
);

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
});
