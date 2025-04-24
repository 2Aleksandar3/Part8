import { useQuery, gql, useMutation } from "@apollo/client";
import { useState } from "react";
import Select from "react-select"; // Import react-select

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

// GraphQL mutation to update author's birth year
const UPDATE_AUTHOR_BIRTHYEAR = gql`
  mutation EditAuthor($name: String!, $born: Int!) {
    editAuthor(name: $name, setBornTo: $born) {
      name
      born
    }
  }
`;

const Authors = ({ loggedIn }) => {
  const { loading, error, data, refetch } = useQuery(GET_AUTHORS);
  const [updateAuthor] = useMutation(UPDATE_AUTHOR_BIRTHYEAR);

  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [birthYear, setBirthYear] = useState("");

  const handleBirthYearChange = (e) => setBirthYear(e.target.value);

  const handleUpdateAuthor = async () => {
    if (!selectedAuthor) {
      alert("Please select an author.");
      return;
    }

    // Validate the birth year input
    if (!birthYear || isNaN(birthYear)) {
      alert("Please enter a valid birth year.");
      return;
    }

    try {
      // Perform the mutation
      await updateAuthor({
        variables: { name: selectedAuthor.value, born: parseInt(birthYear) },
      });

      // Refetch the authors query to update the list
      await refetch();

      // Reset the birth year field after the update
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

      {/* Only show the "Set Birth Year" form if logged in */}
      {loggedIn && (
        <div>
          <h3>Set Birth Year</h3>
          <div>
            <label>
              Author:
              <Select
                value={selectedAuthor}
                onChange={setSelectedAuthor}
                options={authors.map((author) => ({
                  value: author.name,
                  label: author.name,
                }))}
                placeholder="Select an author"
              />
            </label>
          </div>
          <div>
            <label>
              Birth Year:
              <input
                type="number"
                value={birthYear}
                onChange={handleBirthYearChange}
                placeholder="Enter birth year"
              />
            </label>
          </div>
          <button onClick={handleUpdateAuthor}>Update Author</button>
        </div>
      )}
    </div>
  );
};

export default Authors;
