import { useState } from "react";
import { useSubscription, useApolloClient } from "@apollo/client";

import { BOOK_ADDED, GET_ALL_BOOKS } from "./queries";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import Recommendations from "./components/Recommedations";

const updateCache = (cache, query, addedBook) => {
  const uniqueByTitle = (books) => {
    const seen = new Set();
    return books.filter((b) => {
      const title = b.title;
      return seen.has(title) ? false : seen.add(title);
    });
  };

  cache.updateQuery(query, (data) => {
    if (!data) {
      return {
        allBooks: [addedBook],
      };
    }

    return {
      allBooks: uniqueByTitle(data.allBooks.concat(addedBook)),
    };
  });
};

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(localStorage.getItem("auth-token"));
  const [loggedIn, setLoggedIn] = useState(!!token);

  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded;
      alert(
        `📚 New book added: "${addedBook.title}" by ${addedBook.author.name}`
      );
      updateCache(client.cache, { query: GET_ALL_BOOKS }, addedBook);
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    setToken(null);
    setLoggedIn(false);
    setPage("authors");
  };

  return (
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
            <button onClick={() => setPage("recommendations")}>
              Recommedations
            </button>
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
      {page === "recommendations" && <Recommendations loggedIn={loggedIn} />}
    </div>
  );
};

export default App;
