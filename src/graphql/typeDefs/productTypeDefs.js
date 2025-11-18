const productTypeDefs = `#graphql
type Image{
    url:String!
}

type Review {
  id: ID!
  user: ID!
  name: String!
  rating: Float!
  comment: String!
  createdAt: String
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
    reviews:[Review]
    numReviews: Int
    createdAt: String
    updatedAt: String
}

type Pagination {
  currentPage: Int!
  totalPages: Int!
  totalProducts: Int!
  hasNextPage: Boolean!
  hasPrevPage: Boolean!
}

type ProductsResponse {
  products: [Product!]!
  pagination: Pagination!
}

type ProductFilters {
  categories: [String!]!
  brands: [String!]!
}

enum SortOption {
  PRICE_LOW_TO_HIGH
  PRICE_HIGH_TO_LOW
  RATING_HIGH_TO_LOW
  NEWEST
  POPULAR
}

input ProductFilterInput {
  category: String
  brand: String
  minPrice: Float
  maxPrice: Float
  minRating: Float
  inStock: Boolean
  search: String
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
  getAllProducts(
    filter: ProductFilterInput
    sort: SortOption
    page: Int
    limit: Int
  ): ProductsResponse!
  
  getProductById(id:ID!): Product
  
  searchProducts(query: String!, limit: Int): [Product!]!
  
  getProductFilters: ProductFilters!
}

type Mutation {
  createProduct(input:ProductInput!):Product
  updateProduct(id:ID!,input:ProductInput):Product
  deleteProduct(id:ID!):String
  addProductReview(productId: ID!,rating: Float!,comment: String!): String
  deleteProductReview(productId: ID!, reviewId: ID!): String
}
`;

export default productTypeDefs;
