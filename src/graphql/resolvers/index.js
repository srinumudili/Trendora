import cartResolvers from "./cartResolvers.js";
import orderResolvers from "./orderResolvers.js";
import productResolvers from "./productResolvers.js";
import userResolvers from "./userResolvers.js";
import { mergeResolvers } from "@graphql-tools/merge";

const resolvers = mergeResolvers([
  userResolvers,
  productResolvers,
  orderResolvers,
  cartResolvers,
]);

export default resolvers;
