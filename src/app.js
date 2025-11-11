import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import typeDefs from "./graphql/typeDefs/index.js";
import resolvers from "./graphql/resolvers/index.js";
import context from "./graphql/context.js";

dotenv.config();

// Connect to MongoDB
connectDB();

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start standalone server
const { url } = await startStandaloneServer(server, {
  listen: { port: process.env.PORT || 4000 },
  context,
});

console.log(`🚀 Server ready at ${url}`);
