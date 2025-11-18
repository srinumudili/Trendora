import cartTypeDefs from "./cartTypeDefs.js";
import orderTypeDefs from "./orderTypeDefs.js";
import productTypeDefs from "./productTypeDefs.js";
import userTypeDefs from "./userTypeDefs.js";
import { mergeTypeDefs } from "@graphql-tools/merge";

const typeDefs = mergeTypeDefs([
  userTypeDefs,
  productTypeDefs,
  orderTypeDefs,
  cartTypeDefs,
]);

export default typeDefs;
