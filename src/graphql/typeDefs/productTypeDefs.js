const productTypeDefs = `#graphql
type Image{
    url:String!
}

type Product{
    id: ID!
    name: String!
    description: String!
    price: Float!
    stock: Int!
    category: String!
    brand: String
    images: [Image!]!
    rating: Float
    numReviews: Int
    createdAt: String
    updatedAt: String
}
input ImageInput {
    url: String!
  }

  input ProductInput {
    name: String!
    description: String!
    price: Float!
    stock: Int!
    category: String!
    brand: String
    images: [ImageInput!]!
  }

  type Query {
    getAllProducts:[Product!]!
    getProductById(id:ID!) : Product
  }

  type Mutation {
    createProduct(input:ProductInput!):Product
    updateProduct(id:ID!,input:ProductInput):Product
    deleteProduct(id:ID!):String
  }
`;

export default productTypeDefs;
