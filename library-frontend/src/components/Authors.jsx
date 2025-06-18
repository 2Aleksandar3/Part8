import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import Select from "react-select";
import { GET_ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

const Authors = ({ loggedIn }) => {
  const { loading, error, data, refetch } = useQuery(GET_ALL_AUTHORS);
  const [updateAuthor] = useMutation(EDIT_AUTHOR);

  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [birthYear, setBirthYear] = useState("");

  const handleUpdateAuthor = async () => {
    if (!selectedAuthor || !birthYear || isNaN(birthYear)) {
      alert("Please select an author and enter a valid birth year.");
      return;
    }

    try {
      await updateAuthor({
        variables: { name: selectedAuthor.value, born: parseInt(birthYear) },
      });
      await refetch();
      setBirthYear("");
    } catch (error) {
      console.error("Error updating author:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const authors = data.allAuthors;

  return (
    <div>
      <h2>Authors</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Born</th>
            <th>Books</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((author) => (
            <tr key={author.name}>
              <td>{author.name}</td>
              <td>{author.born}</td>
              <td>{author.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {loggedIn && (
        <div>
          <h3>Set Birth Year</h3>
          <Select
            value={selectedAuthor}
            onChange={setSelectedAuthor}
            options={authors.map((a) => ({ value: a.name, label: a.name }))}
            placeholder="Select an author"
          />
          <input
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="Enter birth year"
          />
          <button onClick={handleUpdateAuthor}>Update Author</button>
        </div>
      )}
    </div>
  );
};

export default Authors;
