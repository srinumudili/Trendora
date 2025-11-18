import stripe from "../../config/stripe.js";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import Cart from "../../models/Cart.js";

const orderResolvers = {
  Query: {
    //Fetch all orders(Admin)
    getAllOrders: async (_, __, { user }) => {
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      return await Order.find({})
        .populate("user", "name email")
        .sort({ createdAt: -1 });
    },

    //Fetch single order by id
    getOrderById: async (_, { id }, { user }) => {
      if (!user) throw new Error("Unauthorized: Please login first");

      const order = await Order.findById(id).populate("user", "name email");
      if (!order) throw new Error("Order not found.");

      //Allow access only to admin or order owner
      if (
        order.user._id.toString() !== user._id.toString() &&
        user.role !== "admin"
      ) {
        throw new Error("Unauthorized: You cannot access this order");
      }

      return order;
    },

    // Fetch logged-in user's orders
    getUserOrders: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized: Please login first");
      return await Order.find({ user: user._id }).sort({ createdAt: -1 });
    },
  },

  Mutation: {
    createOrder: async (_, { input }, { user }) => {
      if (!user) throw new Error("Unauthorized: Please login first");

      const { orderItems } = input;
      if (!orderItems || orderItems.length === 0)
        throw new Error("No order items provided");

      // Validate stock for all items
      for (const item of orderItems) {
        const product = await Product.findById(item.product);

        if (!product) {
          throw new Error(`Product ${item.name} not found`);
        }

        if (product.stock < item.qty) {
          throw new Error(
            `Insufficient stock for ${product.name}. Only ${product.stock} available.`
          );
        }
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(input.totalPrice * 100),
        currency: "inr",
        payment_method_types: ["card"],
        metadata: {
          userId: user._id.toString(),
          orderItems: JSON.stringify(
            orderItems.map((item) => ({
              productId: item.product,
              quantity: item.qty,
            }))
          ),
        },
      });

      // Create order
      const newOrder = new Order({
        ...input,
        user: user._id,
        paymentResult: {
          id: paymentIntent.id,
          status: paymentIntent.status,
        },
      });

      await newOrder.save();

      // Reduce stock for each product
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.qty },
        });
      }

      // Clear user's cart after order creation
      const cart = await Cart.findOne({ user: user._id });
      if (cart) {
        cart.clearCart();
        await cart.save();
      }

      return newOrder;
    },

    //Create Stripe PaymentIntent (standalone - for custom flows)
    createStripePaymentIntent: async (_, { amount }, { user }) => {
      try {
        if (!user) throw new Error("Unauthorized: Please login first");

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: "inr",
          payment_method_types: ["card"],
        });

        return { clientSecret: paymentIntent.client_secret };
      } catch (err) {
        console.error("Stripe error:", err.message);
        throw new Error("Error creating payment intent: " + err.message);
      }
    },

    // Mark as paid
    updateOrderToPaid: async (_, { id, paymentResult }, { user }) => {
      if (!user) throw new Error("Unauthorized: Please login first");

      const order = await Order.findById(id);
      if (!order) throw new Error("Order not found");

      // Only allow the owner or admin to mark as paid
      if (
        order.user.toString() !== user._id.toString() &&
        user.role !== "admin"
      ) {
        throw new Error("Unauthorized: You cannot modify this order");
      }

      order.isPaid = true;
      order.paidAt = Date.now();

      // Update payment result if provided
      if (paymentResult) {
        order.paymentResult = {
          id: paymentResult.id,
          status: paymentResult.status,
          update_time: paymentResult.update_time || new Date().toISOString(),
          email_address: paymentResult.email_address || user.email,
        };
      }

      await order.save();
      return "Order marked as paid";
    },

    // Mark as delivered (Admin only)
    updateOrderToDelivered: async (_, { id }, { user }) => {
      if (!user || user.role !== "admin")
        throw new Error("Unauthorized: Admin access required");

      const order = await Order.findById(id);
      if (!order) throw new Error("Order not found");

      if (!order.isPaid) {
        throw new Error("Cannot mark unpaid order as delivered");
      }

      order.isDelivered = true;
      order.deliveredAt = Date.now();

      await order.save();
      return "Order marked as delivered";
    },

    // Cancel order (only if not paid)
    cancelOrder: async (_, { id }, { user }) => {
      if (!user) throw new Error("Unauthorized: Please login first");

      const order = await Order.findById(id);
      if (!order) throw new Error("Order not found");

      // Check authorization
      if (
        order.user.toString() !== user._id.toString() &&
        user.role !== "admin"
      ) {
        throw new Error("Unauthorized: You cannot cancel this order");
      }

      // Can only cancel if not paid
      if (order.isPaid) {
        throw new Error("Cannot cancel paid order. Please contact support.");
      }

      // Restore stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.qty },
        });
      }

      // Delete order
      await Order.findByIdAndDelete(id);

      return "Order cancelled successfully";
    },
  },
};

export default orderResolvers;
