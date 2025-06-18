const { GraphQLError } = require("graphql");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
const jwt = require("jsonwebtoken");

const { Author, Book, User } = require("./models");

const resolvers = {
  Query: {
    allBooks: async (_, { genre }) => {
      if (genre) {
        return await Book.find({ genres: genre }).populate("author", "name");
      }
      return await Book.find().populate("author", "name");
    },
    allAuthors: async () => {
      const authors = await Author.find();

      const bookCounts = await Book.aggregate([
        {
          $group: {
            _id: "$author",
            count: { $sum: 1 },
          },
        },
      ]);

      const countMap = {};
      bookCounts.forEach(({ _id, count }) => {
        countMap[_id.toString()] = count;
      });

      return authors.map((author) => ({
        ...author.toObject(),
        bookCount: countMap[author._id.toString()] || 0,
      }));
    },
    me: async (_, __, context) => {
      return context.currentUser;
    },
  },

  Mutation: {
    addBook: async (_, { title, author, published, genres }, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      let existingAuthor = await Author.findOne({ name: author });
      if (!existingAuthor) {
        existingAuthor = new Author({ name: author });
        await existingAuthor.save();
      }

      const newBook = new Book({
        title,
        author: existingAuthor._id,
        published,
        genres,
      });
      await newBook.save();

      await newBook.populate("author");

      pubsub.publish("BOOK_ADDED", { bookAdded: newBook });

      return newBook;
    },

    editAuthor: async (_, { name, setBornTo }, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const author = await Author.findOne({ name });
      if (author) {
        author.born = setBornTo;
        await author.save();
        return author;
      }
      return null;
    },

    createUser: async (_, { username, favoriteGenre }) => {
      const passwordHash = "hashed_password";
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
      if (!user || password !== "secret") {
        throw new GraphQLError("Invalid credentials");
      }

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

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
