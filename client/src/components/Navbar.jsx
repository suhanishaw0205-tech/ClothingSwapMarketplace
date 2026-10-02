import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert("Logged out successfully!");

    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/listings">ClothingSwap</Link>
      </div>

      <div className="navbar-links">
        <Link to="/listings">Listings</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/swap-requests">Swap Requests</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/calculator">Calculator</Link>
        <Link to="/admin">Admin</Link>
      </div>

      <div className="navbar-auth">
        {token ? (
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="login-link">
              Login
            </Link>

            <Link to="/register" className="register-btn">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;