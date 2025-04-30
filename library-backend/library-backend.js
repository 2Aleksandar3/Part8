const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const express = require("express");
const app = express();
const { expressMiddleware } = require("@apollo/server/express4");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const express = require("express");
const cors = require("cors");
const http = require("http");

// Import the Mongoose models
const { Author, Book, User } = require("./models");

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// GraphQL schema
const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    allBooks(genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }
`;

// Authentication middleware
const authenticate = (context) => {
  const auth = context.req.headers.authorization;
  console.log("Authorization Header:", auth);
  if (!auth) throw new Error("Authentication required");
  const token = auth.split(" ")[1];
  console.log("Token extracted:", token);
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  if (!decodedToken) throw new Error("Invalid or expired token");
  return decodedToken;
};

// Resolvers
const resolvers = {
  Query: {
    allBooks: async (_, args) => {
      if (args.genre) {
        return await Book.find({ genres: args.genre }).populate(
          "author",
          "name"
        );
      }
      return await Book.find().populate("author", "name");
    },
    allAuthors: async () => {
      const authors = await Author.find();
      return authors.map(async (author) => {
        const bookCount = await Book.countDocuments({ author: author._id });
        return {
          name: author.name,
          born: author.born,
          bookCount,
        };
      });
    },
    me: async (_, __, context) => {
      const user = await authenticate(context);
      return await User.findById(user.id);
    },
    /*me: async (_, __, context) => {
      try {
        const user = await authenticate(context);
        if (!user) throw new Error("User not authenticated");

        return user;
      } catch (error) {
        console.error("Error in 'me' resolver:", error);
        throw new Error("Failed to fetch user data");
      }
    },*/
  },

  Mutation: {
    addBook: async (_, { title, author, published, genres }, context) => {
      try {
        await authenticate(context); // Authentication required

        let existingAuthor = await Author.findOne({ name: author });
        if (!existingAuthor) {
          existingAuthor = new Author({ name: author });
          await existingAuthor.save();
        }

        if (!existingAuthor.name) {
          throw new Error("Author name is missing or invalid");
        }

        console.log("Author found/created:", existingAuthor);

        const newBook = new Book({
          title,
          author: existingAuthor._id,
          published,
          genres,
        });
        await newBook.save();

        return newBook.populate("author");
      } catch (error) {
        throw new Error("Error adding book: " + error.message);
      }
    },

    editAuthor: async (_, { name, setBornTo }, context) => {
      //console.log(context, "Context editAuthor");
      console.log("editAuthor mutation triggered");
      //console.log(context.req, "Context req");
      await authenticate(context); // Authentication required

      const authorToEdit = await Author.findOne({ name });
      if (authorToEdit) {
        authorToEdit.born = setBornTo;
        await authorToEdit.save();
        return authorToEdit;
      }
      return null;
    },

    createUser: async (_, { username, favoriteGenre }) => {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("password", salt); // All users have the same password for simplicity
      const newUser = new User({
        username,
        favoriteGenre,
        passwordHash,
      });
      await newUser.save();
      return newUser;
    },

    login: async (_, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user) throw new Error("User not found");

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) throw new Error("Incorrect password");

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      return { value: token };
    },
  },
};

app.use((req, res, next) => {
  console.log("Received request:", req.method, req.url);
  next();
});

console.log("Server starting...");
// Apollo server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the Apollo server
startStandaloneServer(server, {
  listen: { port: 4000 },
  context: ({ req }) => {
    if (!req) {
      throw new Error("Request object is not defined");
    }
    console.log("Context function executed");
    //console.log("Incoming request headers:", req);
    //console.log("Incoming request headers:", req.headers);
    return {
      req, // Pass the request object to context so that the authenticate middleware can access it
    };
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
  //console.log("Server", server.context);
});
