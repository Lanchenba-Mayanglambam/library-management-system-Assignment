import { Link } from "react-router-dom";

function AdminPage() {
  return (
    <div className="home-page">
      <div className="page-card">
        <h1>Admin Dashboard</h1>
        <p>You are viewing a page restricted to administrators.</p>
        <div style={{ margin: "20px 0" }}>
          <Link to="/issues" className="action-link" style={{ display: "inline-block", padding: "10px 16px", background: "#2563eb", color: "white", textDecoration: "none", borderRadius: "5px" }}>
            Manage Book Issues & Returns
          </Link>
        </div>
        <Link to="/">Go back home</Link>
      </div>
    </div>
  );
}

export default AdminPage;
