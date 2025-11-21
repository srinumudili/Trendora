import User from "../../models/User.js";
import {
  validateUserRegistration,
  sanitizeString,
} from "../../utils/validation.js";

const userResolvers = {
  Query: {
    getUserProfile: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized");
      return user;
    },

    // Get all users (Admin only)
    getAllUsers: async (_, { page = 1, limit = 20 }, { user }) => {
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const skip = (page - 1) * limit;

      const users = await User.find({})
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const totalUsers = await User.countDocuments();
      const totalPages = Math.ceil(totalUsers / limit);

      return {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    },

    // Get user by ID (Admin only)
    getUserById: async (_, { id }, { user }) => {
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const targetUser = await User.findById(id).select("-password");
      if (!targetUser) throw new Error("User not found");

      return targetUser;
    },
  },

  Mutation: {
    registerUser: async (_, { name, email, password }) => {
      name = sanitizeString(name);
      email = sanitizeString(email)?.toLowerCase();

      const validation = validateUserRegistration(name, email, password);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const userExists = await User.findOne({ email });
      if (userExists) throw new Error("User already exists with this email");

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
      email = sanitizeString(email)?.toLowerCase();

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid credentials");

      const isValid = await user.validatePassword(password);
      if (!isValid) throw new Error("Invalid credentials");

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

      name = sanitizeString(name);
      email = sanitizeString(email)?.toLowerCase();

      const validation = validateUserRegistration(name, email, password);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error("User with this email already exists");

      const newAdmin = new User({ name, email, password, role: "admin" });
      await newAdmin.save();

      return {
        id: newAdmin._id.toString(),
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      };
    },

    updateUserProfile: async (_, { name, email, password }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const targetUser = await User.findById(user._id);
      if (!targetUser) throw new Error("User not found");

      if (name) {
        targetUser.name = sanitizeString(name);
      }

      if (email) {
        const sanitizedEmail = sanitizeString(email)?.toLowerCase();

        const emailExists = await User.findOne({
          email: sanitizedEmail,
          _id: { $ne: user._id },
        });
        if (emailExists) {
          throw new Error("Email already in use");
        }
        targetUser.email = sanitizedEmail;
      }

      if (password) {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        targetUser.password = password;
      }

      await targetUser.save();

      return {
        id: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      };
    },

    updateUserRole: async (_, { userId, role }, { user }) => {
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      if (!["user", "admin"].includes(role)) {
        throw new Error('Role must be either "user" or "admin"');
      }

      const targetUser = await User.findById(userId);
      if (!targetUser) throw new Error("User not found");

      if (targetUser._id.toString() === user._id.toString()) {
        throw new Error("You cannot change your own role");
      }

      targetUser.role = role;
      await targetUser.save();

      return {
        id: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      };
    },

    deleteUser: async (_, { userId }, { user }) => {
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      if (userId === user._id.toString()) {
        throw new Error("You cannot delete your own account");
      }

      const deletedUser = await User.findByIdAndDelete(userId);
      if (!deletedUser) throw new Error("User not found");

      return "User deleted successfully";
    },
  },
};

export default userResolvers;
