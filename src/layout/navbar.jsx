import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/books");
  };

  return (
    <nav>
      <NavLink to="/books">Books</NavLink>
      {token ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </>
      )}
    </nav>
  );
}
