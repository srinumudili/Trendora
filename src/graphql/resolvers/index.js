import productResolvers from "./productResolvers.js";
import userResolvers from "./userResolvers.js";
import { mergeResolvers } from "@graphql-tools/merge";

const resolvers = mergeResolvers([userResolvers, productResolvers]);

export default resolvers;
