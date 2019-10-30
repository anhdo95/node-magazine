const { buildSchema } = require('graphql')

module.exports = buildSchema(`
  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    email: String!
    name: String!
    password: String
    status: String!
    createdAt: String!
    posts: [Post!]!
  }

  type AuthData {
    token: String!
    userId: String!
  }

  type PostsData {
    items: [Post!]!
    totalItems: Int!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }

  input PostInputData {
    title: String!
    content: String!
    imageUrl: String!
  }

  input PostsQueryInput {
    page: Int!
    itemsPerPage: Int
  }

  type RootQuery {
    login(email: String!, password: String!): AuthData!
    posts(queryInput: PostsQueryInput): PostsData!
    post(id: ID!): Post!
    user: User!
  }

  type RootMutation {
    createUser(userInput: UserInputData): User!
    createPost(postInput: PostInputData): Post!
    updatePost(id: ID!, postInput: PostInputData): Post!
    deletePost(id: ID!): Boolean!
    updateUserStatus(status: String!): User!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`)
