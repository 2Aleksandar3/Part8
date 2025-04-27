import { useQuery, gql } from "@apollo/client";
import { useState } from "react";

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

const Books = () => {
  const [genreFilter, setGenreFilter] = useState("");
  const { loading, error, data } = useQuery(GET_BOOKS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const books = data.allBooks;

  const uniqueGenres = [...new Set(books.flatMap((book) => book.genres))];
  const filteredBooks = books.filter((book) => {
    if (genreFilter === "") return true;
    return book.genres.includes(genreFilter);
  });

  const handleGenreChange = (genre) => {
    setGenreFilter(genre);
  };

  return (
    <div>
      <h2>Books</h2>
      {genreFilter !== "" && (
        <p>
          In genre: <b>{genreFilter}</b>
        </p>
      )}
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
            <th>Genre</th>
          </tr>
        </thead>
        <tbody>
          {filteredBooks.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
              <td>{book.genres.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={() => handleGenreChange("")}>All</button>
        {uniqueGenres.map((genre) => (
          <button key={genre} onClick={() => handleGenreChange(genre)}>
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Books;
