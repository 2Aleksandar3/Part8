import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";

// Create the authLink as an ApolloLink
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("auth-token"); // Dynamically get the token from localStorage

  console.log("Authorization token:", token);

  operation.setContext({
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return forward(operation); // Proceed with the operation
});

const httpLink = new HttpLink({
  uri: "http://localhost:4000", // Your GraphQL server URI
});

const client = new ApolloClient({
  link: authLink.concat(httpLink), // Concatenate authLink and httpLink
  cache: new InMemoryCache(),
});

export default client;
