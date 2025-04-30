import { useQuery, gql } from "@apollo/client";
import { useState } from "react";

const GET_ALL_BOOKS = gql`
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

const GET_BOOKS_BY_GENRE = gql`
  query ($genre: String!) {
    allBooks(genre: $genre) {
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
  const {
    data: allBooksData,
    loading: allBooksLoading,
    error: allBooksError,
  } = useQuery(GET_ALL_BOOKS);
  const {
    data: filteredData,
    loading: filteredLoading,
    error: filteredError,
    refetch: refetchGenreBooks,
  } = useQuery(GET_BOOKS_BY_GENRE, {
    variables: { genre: genreFilter },
    skip: genreFilter === "",
  });

  console.log("filteredData:", filteredData);
  console.log("filteredError:", filteredError);

  if (allBooksLoading || filteredLoading) return <p>Loading...</p>;
  if (allBooksError) return <p>Error: {allBooksError.message}</p>;
  if (filteredError) return <p>Error: {filteredError.message}</p>;

  const books =
    genreFilter === "" ? allBooksData.allBooks : filteredData?.allBooks;

  const uniqueGenres = allBooksData
    ? [...new Set(allBooksData.allBooks.flatMap((book) => book.genres))]
    : [];
  const handleGenreChange = (genre) => {
    setGenreFilter(genre);
    if (genre !== "") {
      refetchGenreBooks({ genre });
    }
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
          {books.map((book) => (
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
