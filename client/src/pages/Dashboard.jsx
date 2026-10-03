import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");

      const savedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!token || !savedUser) {
        setLoading(false);
        navigate("/login");
        return;
      }

      setUser(savedUser);

      try {
        setLoading(true);

        const [
          clothingResponse,
          sentResponse,
          incomingResponse,
        ] = await Promise.all([
          fetch("https://clothing-swap-backend-efmk.onrender.com/api/clothing"),

          fetch("https://clothing-swap-backend-efmk.onrender.com/api/swaps/sent", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("https://clothing-swap-backend-efmk.onrender.com/api/swaps/incoming", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const clothingData =
          await clothingResponse.json();

        const sentData =
          await sentResponse.json();

        const incomingData =
          await incomingResponse.json();

        if (!clothingResponse.ok) {
          throw new Error(
            clothingData.message ||
              "Unable to fetch clothing listings."
          );
        }

        if (!sentResponse.ok) {
          throw new Error(
            sentData.message ||
              "Unable to fetch sent requests."
          );
        }

        if (!incomingResponse.ok) {
          throw new Error(
            incomingData.message ||
              "Unable to fetch incoming requests."
          );
        }

        const currentUserId =
          savedUser.id || savedUser._id;

        const ownedItems = (
          clothingData.items || []
        ).filter(
          (item) =>
            item.owner &&
            item.owner._id === currentUserId
        );

        setMyListings(ownedItems);
        setSentRequests(sentData.requests || []);
        setIncomingRequests(
          incomingData.requests || []
        );
      } catch (error) {
        console.error(
          "Dashboard fetch error:",
          error
        );

        alert("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const totalRequests =
    sentRequests.length + incomingRequests.length;

  const successfulSwaps = [
    ...sentRequests,
    ...incomingRequests,
  ].filter(
    (request) =>
      request.status === "Accepted" ||
      request.status === "Completed"
  );

  const activeChats = successfulSwaps.length;

  const stats = [
    {
      title: "My Listings",
      value: myListings.length,
      icon: "👕",
    },
    {
      title: "Swap Requests",
      value: totalRequests,
      icon: "🔄",
    },
    {
      title: "Successful Swaps",
      value: successfulSwaps.length,
      icon: "✅",
    },
    {
      title: "Active Chats",
      value: activeChats,
      icon: "💬",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>Loading Dashboard...</h1>
            <p>
              Fetching your latest clothing and swap
              activity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-welcome">
            Welcome back 👋
          </p>

          <h1>My Dashboard</h1>

          <p>
            Manage your clothing listings and swap
            activities.
          </p>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            {user?.name
              ? user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "U"}
          </div>

          <div>
            <h3>{user?.name || "User"}</h3>

            <p>
              {user?.location || "Location not available"}
            </p>
          </div>
        </div>
      </div>

      <section className="dashboard-stats">
        {stats.map((stat) => (
          <div
            className="stat-card"
            key={stat.title}
          >
            <div className="stat-icon">
              {stat.icon}
            </div>

            <div>
              <p>{stat.title}</p>
              <h2>{stat.value}</h2>
            </div>
          </div>
        ))}
      </section>

      <section className="recent-listings-section">
        <div className="dashboard-section-header">
          <div>
            <h2>My Recent Listings</h2>

            <p>
              Your recently added clothing items.
            </p>
          </div>

          <button
            className="dashboard-add-btn"
            onClick={() =>
              navigate("/add-clothing")
            }
          >
            + Add Listing
          </button>
        </div>

        {myListings.length === 0 ? (
          <div className="dashboard-table">
            <div className="table-row">
              <span>
                You have not added any clothing
                listings yet.
              </span>
            </div>
          </div>
        ) : (
          <div className="dashboard-table">
            <div className="table-header">
              <span>Clothing</span>
              <span>Size</span>
              <span>Condition</span>
              <span>Value</span>
              <span>Status</span>
            </div>

            {myListings
              .slice(0, 5)
              .map((item) => (
                <div
                  className="table-row"
                  key={item._id}
                >
                  <strong>{item.title}</strong>

                  <span>{item.size}</span>

                  <span>
                    {item.condition}
                  </span>

                  <strong>
                    ₹{item.value}
                  </strong>

                  <span className="available-status">
                    {item.available
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;