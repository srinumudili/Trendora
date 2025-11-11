import Product from "../../models/Product.js";

const productResolvers = {
  Query: {
    //Fetch all products
    getAllProducts: async () => {
      try {
        const products = await Product.find({});
        return products;
      } catch (err) {
        throw new Error("Error fetching products: " + err.message);
      }
    },

    //Fetch Product By Id
    getProductById: async (_, { id }) => {
      try {
        const product = await Product.findById(id);
        if (!product) throw new Error("Product not found");
        return product;
      } catch (err) {
        throw new Error("Error fetching product: " + err.message);
      }
    },
  },

  Mutation: {
    // Create a new Product
    createProduct: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new Error("Unauthorized: Admin access required (no user)");
        }

        if (user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required (not admin)");
        }

        const newProduct = new Product(input);
        const savedProduct = await newProduct.save();
        return savedProduct;
      } catch (err) {
        console.error("❌ Error in createProduct:", err.message);
        throw new Error("Error creating product: " + err.message);
      }
    },

    //Update a Product
    updateProduct: async (_, { id, input }, { user }) => {
      try {
        if (!user || user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, input, {
          new: true,
        });

        if (!updatedProduct) throw new Error("Product not found");
        return updatedProduct;
      } catch (err) {
        throw new Error("Error updating product: " + err.message);
      }
    },

    // Delete a product
    deleteProduct: async (_, { id }, { user }) => {
      try {
        if (!user || user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) throw new Error("Product not found");

        return "Product deleted successfully";
      } catch (err) {
        throw new Error("Error deleting product: " + err.message);
      }
    },
  },
};

export default productResolvers;
