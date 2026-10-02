import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Listings() {
  const navigate = useNavigate();

  const [clothingItems, setClothingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [location, setLocation] = useState("");

  const [userLocation, setUserLocation] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (savedUser && savedUser.location) {
      setUserLocation(savedUser.location);
    }
  }, []);

  useEffect(() => {
    const fetchClothingItems = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/clothing"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to fetch clothing listings."
          );
        }

        setClothingItems(data.items || []);
      } catch (error) {
        console.error("Fetch clothing error:", error);
        setError("Unable to load clothing listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchClothingItems();
  }, []);

  const filteredItems = clothingItems
    .filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(searchText) ||
        item.brand.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "" || item.category === category;

      const matchesSize =
        size === "" || item.size === size;

      const matchesLocation =
        location === "" || item.location === location;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSize &&
        matchesLocation
      );
    })
    .sort((a, b) => {
      if (!userLocation) {
        return 0;
      }

      const aNearby =
        a.location.toLowerCase() ===
        userLocation.toLowerCase();

      const bNearby =
        b.location.toLowerCase() ===
        userLocation.toLowerCase();

      if (aNearby && !bNearby) {
        return -1;
      }

      if (!aNearby && bNearby) {
        return 1;
      }

      return 0;
    });

  const nearbyCount = filteredItems.filter(
    (item) =>
      userLocation &&
      item.location.toLowerCase() ===
        userLocation.toLowerCase()
  ).length;

  return (
    <div className="listings-page">
      <header className="listings-header">
        <div>
          <h1>Clothing Swap Marketplace</h1>

          <p>
            Discover clothes from other users and exchange items you love.
          </p>

          {userLocation && (
            <p className="nearby-info">
              📍 Showing nearby swap suggestions for{" "}
              <strong>{userLocation}</strong>
            </p>
          )}
        </div>

        <button
          className="add-listing-btn"
          onClick={() => navigate("/add-clothing")}
        >
          + Add Clothing
        </button>
      </header>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search clothing or brand..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">All Categories</option>
          <option value="shirts">Shirts</option>
          <option value="dresses">Dresses</option>
          <option value="jackets">Jackets</option>
          <option value="hoodies">Hoodies</option>
        </select>

        <select
          value={size}
          onChange={(event) => setSize(event.target.value)}
        >
          <option value="">All Sizes</option>
          <option value="S">Small</option>
          <option value="M">Medium</option>
          <option value="L">Large</option>
          <option value="XL">XL</option>
        </select>

        <select
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        >
          <option value="">All Locations</option>
          <option value="Kolkata">Kolkata</option>
          <option value="Howrah">Howrah</option>
        </select>
      </div>

      <section className="listings-section">
        <div className="section-heading">
          <div>
            <h2>Available Clothing</h2>

            {userLocation && nearbyCount > 0 && (
              <p className="nearby-count">
                {nearbyCount} nearby item
                {nearbyCount > 1 ? "s" : ""} available in{" "}
                {userLocation}
              </p>
            )}
          </div>

          <span>{filteredItems.length} items</span>
        </div>

        {loading ? (
          <p>Loading clothing listings...</p>
        ) : error ? (
          <p>{error}</p>
        ) : filteredItems.length === 0 ? (
          <p>No clothing items found.</p>
        ) : (
          <div className="clothing-grid">
            {filteredItems.map((item) => {
              const isNearby =
                userLocation &&
                item.location.toLowerCase() ===
                  userLocation.toLowerCase();

              return (
                <div
                  className="clothing-card"
                  key={item._id}
                >
                  <div className="clothing-image-wrapper">
                    <img
                      src={item.image}
                      alt={item.title}
                    />

                    {isNearby && (
                      <span className="nearby-badge">
                        📍 Nearby for you
                      </span>
                    )}
                  </div>

                  <div className="clothing-card-content">
                    <h3>{item.title}</h3>

                    <p className="brand">
                      {item.brand} · Size {item.size}
                    </p>

                    <p className="condition">
                      Condition: {item.condition}
                    </p>

                    <p className="location">
                      📍 {item.location}
                    </p>

                    <div className="card-bottom">
                      <strong>₹{item.value}</strong>

                      <Link
                        to={`/item/${item._id}`}
                        className="view-details-btn"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Listings;