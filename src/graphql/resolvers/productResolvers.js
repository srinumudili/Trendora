import Product from "../../models/Product.js";

const productResolvers = {
  Query: {
    // Fetch all products with pagination, filtering, and sorting
    getAllProducts: async (_, { filter, sort, page = 1, limit = 12 }) => {
      try {
        // Build filter query
        const query = {};

        if (filter) {
          if (filter.category) {
            query.category = { $regex: `^${filter.category}$`, $options: "i" };
          }

          if (filter.brand) {
            query.brand = { $regex: `^${filter.brand}$`, $options: "i" };
          }

          if (filter.minPrice || filter.maxPrice) {
            query.price = {};
            if (filter.minPrice) query.price.$gte = filter.minPrice;
            if (filter.maxPrice) query.price.$lte = filter.maxPrice;
          }

          if (filter.minRating) {
            query.rating = { $gte: filter.minRating };
          }

          if (filter.inStock) {
            query.stock = { $gt: 0 };
          }

          if (filter.search) {
            query.$or = [
              { name: { $regex: filter.search, $options: "i" } },
              { description: { $regex: filter.search, $options: "i" } },
              { category: { $regex: filter.search, $options: "i" } },
              { brand: { $regex: filter.search, $options: "i" } },
            ];
          }
        }

        // Build sort query
        let sortQuery = {};
        if (sort) {
          switch (sort) {
            case "PRICE_LOW_TO_HIGH":
              sortQuery = { price: 1 };
              break;
            case "PRICE_HIGH_TO_LOW":
              sortQuery = { price: -1 };
              break;
            case "RATING_HIGH_TO_LOW":
              sortQuery = { rating: -1 };
              break;
            case "NEWEST":
              sortQuery = { createdAt: -1 };
              break;
            case "POPULAR":
              sortQuery = { numReviews: -1 };
              break;
            default:
              sortQuery = { createdAt: -1 };
          }
        } else {
          sortQuery = { createdAt: -1 };
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query
        const products = await Product.find(query)
          .sort(sortQuery)
          .limit(limit)
          .skip(skip);

        // Get total count for pagination
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        return {
          products,
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        };
      } catch (err) {
        throw new Error("Error fetching products: " + err.message);
      }
    },

    // Get unique categories and brands for filters
    getProductFilters: async () => {
      try {
        const categories = await Product.distinct("category");
        const brands = await Product.distinct("brand");

        return {
          categories: categories.filter(Boolean),
          brands: brands.filter(Boolean),
        };
      } catch (err) {
        throw new Error("Error fetching filters: " + err.message);
      }
    },

    //Fetch Product By Id
    getProductById: async (_, { id }) => {
      try {
        const product = await Product.findById(id).populate(
          "reviews.user",
          "name"
        );
        if (!product) throw new Error("Product not found");
        return product;
      } catch (err) {
        throw new Error("Error fetching product: " + err.message);
      }
    },

    // Search products
    searchProducts: async (_, { query, limit = 10 }) => {
      try {
        const products = await Product.find({
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } },
            { brand: { $regex: query, $options: "i" } },
          ],
        }).limit(limit);

        return products;
      } catch (err) {
        throw new Error("Error searching products: " + err.message);
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
          runValidators: true,
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

    //Add product review
    addProductReview: async (_, { productId, rating, comment }, { user }) => {
      try {
        if (!user) throw new Error("Unauthorized: Please login first");

        const product = await Product.findById(productId).exec();
        if (!product) throw new Error("Product not found");

        if (!Array.isArray(product.reviews)) {
          product.reviews = [];
        }

        const alreadyReviewed = product.reviews.find(
          (rev) => rev.user.toString() === user._id.toString()
        );
        if (alreadyReviewed) {
          throw new Error("You have already reviewed this product");
        }

        const review = {
          user: user._id,
          name: user.name,
          rating: Number(rating),
          comment,
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
          product.reviews.reduce((acc, rev) => acc + rev.rating, 0) /
          product.reviews.length;

        await product.save();

        return "Review added successfully";
      } catch (err) {
        throw new Error("Error adding review: " + err.message);
      }
    },

    // Delete a review (Admin or review owner)
    deleteProductReview: async (_, { productId, reviewId }, { user }) => {
      try {
        if (!user) throw new Error("Unauthorized: Please login first");

        const product = await Product.findById(productId);
        if (!product) throw new Error("Product not found");

        const review = product.reviews.id(reviewId);
        if (!review) throw new Error("Review not found");

        // Check if user is admin or review owner
        if (
          user.role !== "admin" &&
          review.user.toString() !== user._id.toString()
        ) {
          throw new Error("Unauthorized: Cannot delete this review");
        }

        product.reviews.pull(reviewId);
        product.numReviews = product.reviews.length;

        // Recalculate rating
        if (product.reviews.length > 0) {
          product.rating =
            product.reviews.reduce((acc, rev) => acc + rev.rating, 0) /
            product.reviews.length;
        } else {
          product.rating = 0;
        }

        await product.save();

        return "Review deleted successfully";
      } catch (err) {
        throw new Error("Error deleting review: " + err.message);
      }
    },
  },
};

export default productResolvers;
