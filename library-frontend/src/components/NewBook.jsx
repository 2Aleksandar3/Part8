import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_BOOK, GET_ALL_BOOKS, GET_ALL_AUTHORS } from "../queries";

const NewBook = ({ loggedIn }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: GET_ALL_BOOKS }, { query: GET_ALL_AUTHORS }],
  });

  const submit = async (event) => {
    event.preventDefault();

    try {
      await addBook({
        variables: {
          title,
          author,
          published: parseInt(published),
          genres,
        },
      });
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
    setGenres((prev) => [...prev, genre]);
    setGenre("");
  };

  if (!loggedIn) return <div>You must be logged in to add a book.</div>;

  return (
    <div>
      <h3>Add New Book</h3>
      <form onSubmit={submit}>
        <div>
          Title{" "}
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          Author{" "}
          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div>
          Published{" "}
          <input
            type="number"
            value={published}
            onChange={(e) => setPublished(e.target.value)}
          />
        </div>
        <div>
          <input value={genre} onChange={(e) => setGenre(e.target.value)} />
          <button type="button" onClick={addGenre}>
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
