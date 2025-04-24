import { useState } from "react";
import { useMutation, gql } from "@apollo/client";

// GraphQL mutation to add a new book
const ADD_BOOK = gql`
  mutation AddBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      title
      author {
        name
      }
      published
      genres
    }
  }
`;

// GraphQL query to get books
const GET_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
      }
      published
      genres
    }
  }
`;

// GraphQL query to get authors
const GET_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

const NewBook = ({ loggedIn }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [
      { query: GET_BOOKS }, // Refetch the books query
      { query: GET_AUTHORS }, // Refetch the authors query after mutation
    ],
  });

  const submit = async (event) => {
    event.preventDefault();

    try {
      const { data } = await addBook({
        variables: {
          title,
          author,
          published: parseInt(published),
          genres,
        },
      });

      console.log("Book added:", data.addBook);

      setTitle("");
      setAuthor("");
      setPublished("");
      setGenres([]);
      setGenre("");
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  if (!loggedIn) {
    return <div>You must be logged in to add a book.</div>; // Show a message if not logged in
  }

  return (
    <div>
      <h3>Add New Book</h3>
      <form onSubmit={submit}>
        <div>
          Title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          Author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          Published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            Add Genre
          </button>
        </div>
        <div>Genres: {genres.join(" ")}</div>
        <button type="submit">Create Book</button>
      </form>
    </div>
  );
};

export default NewBook;
