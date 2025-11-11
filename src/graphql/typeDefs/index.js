import productTypeDefs from "./productTypeDefs.js";
import userTypeDefs from "./userTypeDefs.js";
import { mergeTypeDefs } from "@graphql-tools/merge";

const typeDefs = mergeTypeDefs([userTypeDefs, productTypeDefs]);

export default typeDefs;
