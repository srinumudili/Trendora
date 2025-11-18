const orderTypeDefs = `#graphql
type OrderItem{
    product:ID!
    name:String!
    image:String! 
    qty:Int!
    price:Float!
}

type ShippingAddress{
    address:String!
    city:String! 
    postalCode:String!
    country:String!
}

type PaymentResult {
  id: String
  status: String
  update_time: String
  email_address: String
}

type UserInfo {
  id: ID!
  name: String!
  email: String!
}

type Order{
    id:ID!
    user:UserInfo!
    orderItems:[OrderItem!]!
    shippingAddress:ShippingAddress!
    paymentMethod: String!
    paymentResult: PaymentResult
    itemsPrice: Float!
    shippingPrice: Float!
    taxPrice: Float!
    totalPrice: Float!
    isPaid: Boolean!
    paidAt: String
    isDelivered: Boolean!
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
  updateOrderToPaid(id: ID!, paymentResult: PaymentResultInput): String
  updateOrderToDelivered(id: ID!): String
  cancelOrder(id: ID!): String
  createStripePaymentIntent(amount: Float!): PaymentIntentResponse
}

`;

export default orderTypeDefs;
