import { useEffect, useState } from "react";

function AdminPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login as admin.");
          return;
        }

        const response = await fetch(
          "https://clothing-swap-backend-efmk.onrender.com/api/admin/dashboard",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Unable to load admin data.");
          return;
        }

        setData(result);
      } catch (error) {
        console.error(error);
        setError("Backend server is not running.");
      }
    };

    fetchAdminData();
  }, []);

  if (error) {
    return (
      <div className="admin-page">
        <h1>Admin Panel</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-page">
        <h1>Admin Panel</h1>
        <p>Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <p className="admin-label">Administration</p>
          <h1>Admin Panel</h1>
          <p>Manage marketplace activity.</p>
        </div>

        <span className="admin-badge">Admin Access</span>
      </div>

      <section className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div>
            <p>Total Users</p>
            <h2>{data.stats.totalUsers}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👕</div>
          <div>
            <p>Total Listings</p>
            <h2>{data.stats.totalListings}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🔄</div>
          <div>
            <p>Active Swaps</p>
            <h2>{data.stats.activeSwaps}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>
          <div>
            <p>Completed Swaps</p>
            <h2>{data.stats.completedSwaps}</h2>
          </div>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>Recent Listings</h2>
            <p>Latest clothing items submitted by users.</p>
          </div>

          <button
            className="admin-action-btn"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </button>
        </div>

        <div className="admin-table">
          <div className="admin-table-header">
            <span>Item</span>
            <span>User</span>
            <span>Category</span>
            <span>Status</span>
          </div>

          {data.recentListings.length === 0 ? (
            <div className="admin-table-row">
              <span>No listings found.</span>
            </div>
          ) : (
            data.recentListings.map((listing) => (
              <div
                className="admin-table-row"
                key={listing._id}
              >
                <strong>{listing.title}</strong>

                <span>
                  {listing.owner
                    ? listing.owner.name
                    : "Unknown User"}
                </span>

                <span>
                  {listing.category
                    ? listing.category.charAt(0).toUpperCase() +
                      listing.category.slice(1)
                    : "Unknown"}
                </span>

                <span
                  className={
                    listing.available
                      ? "admin-status available"
                      : "admin-status review"
                  }
                >
                  {listing.available
                    ? "Available"
                    : "Unavailable"}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminPanel;