const uploadTypeDefs = `#graphql
  type ImageUploadResponse {
    url: String!
    publicId: String!
  }

  type Mutation {
    uploadImage(file: String!): ImageUploadResponse!
    
    uploadMultipleImages(files: [String!]!): [ImageUploadResponse!]!
    
    deleteImage(publicId: String!): String!
  }
`;

export default uploadTypeDefs;
