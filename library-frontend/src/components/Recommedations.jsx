import { useQuery } from "@apollo/client";
import { GET_USER_FAVOURITE_GENRE, GET_ALL_BOOKS } from "../queries";

const Recommendations = () => {
  const { data: userData, loading, error } = useQuery(GET_USER_FAVOURITE_GENRE);
  const {
    data: booksData,
    loading: booksLoading,
    error: booksError,
  } = useQuery(GET_ALL_BOOKS);

  const favoriteGenre = userData?.me?.favoriteGenre;
  const books = booksData?.allBooks || [];
  const filteredBooks = books.filter((book) =>
    book.genres.includes(favoriteGenre)
  );

  if (loading || booksLoading) return <p>Loading...</p>;
  if (error || booksError)
    return <p>Error: {error?.message || booksError?.message}</p>;

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        Books in your favorite genre: <b>{favoriteGenre}</b>
      </p>
      {favoriteGenre ? (
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
      ) : (
        <p>No favorite genre selected</p>
      )}
    </div>
  );
};

export default Recommendations;
