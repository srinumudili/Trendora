import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";

const cartResolvers = {
  Query: {
    getCart: async (_, { sessionId }, { user }) => {
      try {
        let cart;

        if (user) {
          cart = await Cart.findOne({ user: user._id });
        } else if (sessionId) {
          cart = await Cart.findOne({ sessionId });
        } else {
          throw new Error("No user or session ID provided");
        }

        if (!cart) {
          cart = new Cart({
            user: user?._id,
            sessionId: !user ? sessionId : undefined,
            items: [],
          });
          await cart.save();
        }

        return cart;
      } catch (err) {
        throw new Error("Error fetching cart: " + err.message);
      }
    },
  },

  Mutation: {
    addToCart: async (_, { input }, { user }) => {
      try {
        const { productId, quantity, sessionId } = input;

        const product = await Product.findById(productId);
        if (!product) throw new Error("Product not found");

        if (product.stock < quantity) {
          throw new Error(`Only ${product.stock} items available in stock`);
        }

        let cart;
        if (user) {
          cart = await Cart.findOne({ user: user._id });
          if (!cart) {
            cart = new Cart({ user: user._id, items: [] });
          }
        } else if (sessionId) {
          cart = await Cart.findOne({ sessionId });
          if (!cart) {
            cart = new Cart({ sessionId, items: [] });
          }
        } else {
          throw new Error("Please provide sessionId for guest checkout");
        }

        const existingItemIndex = cart.items.findIndex(
          (item) => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
          const newQuantity = cart.items[existingItemIndex].quantity + quantity;

          if (newQuantity > product.stock) {
            throw new Error(
              `Cannot add more. Only ${product.stock} items available`
            );
          }

          cart.items[existingItemIndex].quantity = newQuantity;
        } else {
          cart.items.push({
            product: product._id,
            name: product.name,
            image: product.images[0]?.url || "",
            price: product.price,
            quantity,
            stock: product.stock,
          });
        }

        await cart.save();
        return cart;
      } catch (err) {
        throw new Error("Error adding to cart: " + err.message);
      }
    },

    updateCartItem: async (_, { input }, { user }) => {
      try {
        const { productId, quantity, sessionId } = input;

        let cart;
        if (user) {
          cart = await Cart.findOne({ user: user._id });
        } else if (sessionId) {
          cart = await Cart.findOne({ sessionId });
        }

        if (!cart) throw new Error("Cart not found");

        if (quantity > 0) {
          const product = await Product.findById(productId);
          if (!product) throw new Error("Product not found");

          if (quantity > product.stock) {
            throw new Error(`Only ${product.stock} items available in stock`);
          }
        }

        const updated = cart.updateItemQuantity(productId, quantity);
        if (!updated) throw new Error("Item not found in cart");

        await cart.save();
        return cart;
      } catch (err) {
        throw new Error("Error updating cart: " + err.message);
      }
    },

    removeFromCart: async (_, { input }, { user }) => {
      try {
        const { productId, sessionId } = input;

        let cart;
        if (user) {
          cart = await Cart.findOne({ user: user._id });
        } else if (sessionId) {
          cart = await Cart.findOne({ sessionId });
        }

        if (!cart) throw new Error("Cart not found");

        cart.removeItem(productId);
        await cart.save();

        return cart;
      } catch (err) {
        throw new Error("Error removing from cart: " + err.message);
      }
    },

    clearCart: async (_, { sessionId }, { user }) => {
      try {
        let cart;

        if (user) {
          cart = await Cart.findOne({ user: user._id });
        } else if (sessionId) {
          cart = await Cart.findOne({ sessionId });
        }

        if (!cart) throw new Error("Cart not found");

        cart.clearCart();
        await cart.save();

        return "Cart cleared successfully";
      } catch (err) {
        throw new Error("Error clearing cart: " + err.message);
      }
    },

    mergeCarts: async (_, { guestSessionId }, { user }) => {
      try {
        if (!user) throw new Error("User must be logged in to merge carts");

        const guestCart = await Cart.findOne({ sessionId: guestSessionId });
        if (!guestCart || guestCart.items.length === 0) {
          let userCart = await Cart.findOne({ user: user._id });
          if (!userCart) {
            userCart = new Cart({ user: user._id, items: [] });
            await userCart.save();
          }
          return userCart;
        }

        let userCart = await Cart.findOne({ user: user._id });
        if (!userCart) {
          userCart = new Cart({ user: user._id, items: [] });
        }

        for (const guestItem of guestCart.items) {
          const existingItemIndex = userCart.items.findIndex(
            (item) => item.product.toString() === guestItem.product.toString()
          );

          if (existingItemIndex > -1) {
            userCart.items[existingItemIndex].quantity += guestItem.quantity;
          } else {
            userCart.items.push(guestItem);
          }
        }

        await userCart.save();

        await Cart.deleteOne({ sessionId: guestSessionId });

        return userCart;
      } catch (err) {
        throw new Error("Error merging carts: " + err.message);
      }
    },
  },
};

export default cartResolvers;
