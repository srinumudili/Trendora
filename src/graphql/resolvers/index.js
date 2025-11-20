import cartResolvers from "./cartResolvers.js";
import orderResolvers from "./orderResolvers.js";
import productResolvers from "./productResolvers.js";
import uploadResolvers from "./uploadResolvers.js";
import userResolvers from "./userResolvers.js";
import { mergeResolvers } from "@graphql-tools/merge";

const resolvers = mergeResolvers([
  userResolvers,
  productResolvers,
  orderResolvers,
  cartResolvers,
  uploadResolvers,
]);

export default resolvers;
