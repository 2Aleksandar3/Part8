const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/use/ws");
const { Author, Book, User } = require("./models");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

require("dotenv").config();

const app = express();
const httpServer = http.createServer(app);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

mongoose.set("debug", true);

// Schema and resolvers
const typeDefs = require("./schema");
const resolvers = require("./resolvers");

// Setup server
const start = async () => {
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer({ schema }, wsServer);
  const server = new ApolloServer({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    introspection: true,
    playground: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith("Bearer ")) {
          const decodedToken = jwt.verify(
            auth.substring(7),
            process.env.JWT_SECRET
          );
          const currentUser = await User.findById(decodedToken.id);
          return { currentUser };
        }
      },
      introspection: true,
    })
  );

  const PORT = 4000;
  httpServer.listen(PORT, () =>
    console.log(`Server is running on http://localhost:${PORT}`)
  );
};

start();
