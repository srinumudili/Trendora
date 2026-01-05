const orderTypeDefs = `#graphql
type OrderItem {
  product: ID!
  name: String!
  image: String!
  qty: Int!
  price: Float!

  size: String!
  color: String!
}


type ShippingAddress{
    address:String!
    city:String! 
    postalCode:String!
    country:String!
}

type PaymentResult {
  paymentIntentId: String!
  status: String!
  amount: Float!
  currency: String!
}


type UserInfo {
  id: ID!
  name: String!
  email: String!
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}


type Order {
  id: ID!
  user: UserInfo!
  orderItems: [OrderItem!]!
  shippingAddress: ShippingAddress!
  paymentMethod: String!

  status: OrderStatus!

  paymentResult: PaymentResult
  itemsPrice: Float!
  shippingPrice: Float!
  taxPrice: Float!
  totalPrice: Float!

  paidAt: String
  deliveredAt: String
  createdAt: String
  updatedAt: String
}


type PaymentIntentResponse{
  clientSecret:String!
}

input OrderItemInput {
  product: ID!
  name: String!
  image: String!
  qty: Int!
  price: Float!

  size: String!
  color: String!
}


input ShippingAddressInput {
  address: String!
  city: String!
  postalCode: String!
  country: String!
}

input OrderInput {
  orderItems: [OrderItemInput!]!
  shippingAddress: ShippingAddressInput!
  paymentMethod: String!
  itemsPrice: Float!
  shippingPrice: Float!
  taxPrice: Float!
  totalPrice: Float!
}

input PaymentResultInput {
  id: String
  status: String
  update_time: String
  email_address: String
}

type Query{
    getUserOrders:[Order!]!
    getAllOrders:[Order!]!
    getOrderById(id: ID!):Order
}

type Mutation {
  createOrder(input: OrderInput!): Order
  updateOrderToPaid(
  id: ID!
  paymentResult: PaymentResultInput!
): Order

  updateOrderToDelivered(id: ID!): String
  updateOrderStatus(
    id: ID!
    status: OrderStatus!
  ): Order
  cancelOrder(id: ID!): String
  createStripePaymentIntent(amount: Float!): PaymentIntentResponse
}

`;

export default orderTypeDefs;
