import { useState } from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient"; // Import the Apollo Client

import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";

const App = () => {
  const [page, setPage] = useState("authors"); // Default to authors page
  const [token, setToken] = useState(localStorage.getItem("auth-token")); // Retrieve token from localStorage if exists
  const [loggedIn, setLoggedIn] = useState(!!token); // Check if the user is logged in

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    setToken(null);
    setLoggedIn(false);
    setPage("authors"); // Go back to authors page after logging out
  };

  return (
    <ApolloProvider client={client}>
      <div>
        {/* Navigation Bar */}
        <div>
          {!loggedIn && (
            <>
              <button onClick={() => setPage("authors")}>Authors</button>
              <button onClick={() => setPage("books")}>Books</button>
              <button onClick={() => setPage("login")}>Login</button>
            </>
          )}
          {loggedIn && (
            <>
              <button onClick={() => setPage("authors")}>Authors</button>
              <button onClick={() => setPage("books")}>Books</button>
              <button onClick={() => setPage("add")}>Add Book</button>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>

        {/* Render the selected page */}
        {page === "login" && (
          <Login setToken={setToken} setLoggedIn={setLoggedIn} />
        )}
        {page === "authors" && <Authors loggedIn={loggedIn} />}
        {page === "books" && <Books loggedIn={loggedIn} />}
        {page === "add" && <NewBook loggedIn={loggedIn} />}
      </div>
    </ApolloProvider>
  );
};

export default App;
