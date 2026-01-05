const cartTypeDefs = `#graphql
type CartItem {
  product: ID!
  name: String!
  image: String!
  price: Float!
  quantity: Int!
  stock: Int!

  size: String!
  color: String!
}


  type Cart {
    id: ID!
    user: ID
    sessionId: String
    items: [CartItem!]!
    totalItems: Int!
    totalPrice: Float!
    createdAt: String
    updatedAt: String
  }

input AddToCartInput {
  productId: ID!
  quantity: Int!
  size: String!
  color: String!
  sessionId: String
}

input UpdateCartItemInput {
  productId: ID!
  quantity: Int!
  size: String!
  color: String!
  sessionId: String
}

input RemoveFromCartInput {
    productId: ID!
    sessionId: String 
  }

type Query {
    getCart(sessionId: String): Cart
  }

type Mutation {
    
    addToCart(input: AddToCartInput!): Cart
    
    
    updateCartItem(input: UpdateCartItemInput!): Cart
    
   
    removeFromCart(input: RemoveFromCartInput!): Cart
    
  
    clearCart(sessionId: String): String
    
   
    mergeCarts(guestSessionId: String!): Cart
  }

`;

export default cartTypeDefs;
