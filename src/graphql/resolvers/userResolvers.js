import User from "../../models/User.js";

const userResolvers = {
  Query: {
    getUserProfile: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized");
      return user;
    },
  },
  Mutation: {
    registerUser: async (_, { name, email, password }) => {
      const userExists = await User.findOne({ email });
      if (userExists) throw new Error("User already exists");

      const user = new User({ name, email, password, role: "user" });
      await user.save();

      const token = user.getJWT();

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      };
    },
    loginUser: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid credentials!");

      const isValid = await user.validatePassword(password);
      if (!isValid) throw new Error("Invalid credentials!");

      const token = user.getJWT();

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      };
    },
    createAdminUser: async (_, { name, email, password }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      if (user.role !== "admin") throw new Error("Access denied: Admins only");

      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error("User with this email already exists");

      // Create new admin user
      const newAdmin = new User({ name, email, password, role: "admin" });
      await newAdmin.save();

      return {
        id: newAdmin._id.toString(),
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      };
    },
  },
};

export default userResolvers;
