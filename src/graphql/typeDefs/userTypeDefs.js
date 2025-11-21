const userTypeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    token: String
    createdAt: String
    updatedAt: String
  }

  type UsersPagination {
    currentPage: Int!
    totalPages: Int!
    totalUsers: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
  }

  type UsersResponse {
    users: [User!]!
    pagination: UsersPagination!
  }

  type Query {
    getUserProfile: User
    
    getAllUsers(page: Int, limit: Int): UsersResponse!
    
    getUserById(id: ID!): User
  }

  type Mutation {
    registerUser(name: String!, email: String!, password: String!): User
    
    loginUser(email: String!, password: String!): User
    
    createAdminUser(name: String!, email: String!, password: String!): User
    
    
    updateUserProfile(name: String, email: String, password: String): User
    
   
    updateUserRole(userId: ID!, role: String!): User
    
    
    deleteUser(userId: ID!): String
  }
`;

export default userTypeDefs;
