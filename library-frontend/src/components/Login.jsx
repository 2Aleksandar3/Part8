import { useState } from "react";
import { useMutation, gql } from "@apollo/client";

// GraphQL login mutation
const LOGIN_USER = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

const Login = ({ setToken, setLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login] = useMutation(LOGIN_USER);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await login({ variables: { username, password } });

      // Store the JWT token in localStorage
      localStorage.setItem("auth-token", data.login.value);

      // Update state to reflect user login
      setToken(data.login.value);
      setLoggedIn(true);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Log in</button>
      </form>
    </div>
  );
};

export default Login;
