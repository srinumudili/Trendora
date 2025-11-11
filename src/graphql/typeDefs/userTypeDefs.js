const userTypeDefs = `#graphql
  type User{
    id: ID!
    name:String!
    email:String!
    role: String! 
    token:String
  }

  type Query {
    getUserProfile: User
  }

  type Mutation{
    registerUser(name: String!, email: String!, password: String!): User
    loginUser(email: String!, password: String!): User
    createAdminUser(name: String!, email: String!, password: String!):User
  }
`;

export default userTypeDefs;
