import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function ItemDetails() {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [myItems, setMyItems] = useState([]);

  const [selectedItemId, setSelectedItemId] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/clothing"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to fetch clothing items."
          );
        }

        const foundItem = data.items.find(
          (clothing) => clothing._id === id
        );

        if (!foundItem) {
          setError("Clothing item not found.");
          return;
        }

        setItem(foundItem);

        const user = JSON.parse(
          localStorage.getItem("user") || "null"
        );

        if (user) {
          const currentUserId = user.id || user._id;

          const ownedItems = data.items.filter(
            (clothing) =>
              clothing.owner &&
              clothing.owner._id === currentUserId &&
              clothing._id !== id &&
              clothing.available
          );

          setMyItems(ownedItems);
        }
      } catch (error) {
        console.error("Fetch item error:", error);
        setError("Unable to load clothing item.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSwapRequest = async () => {
    if (!selectedItemId) {
      alert("Please select an item that you want to offer.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before requesting a swap.");
      return;
    }

    try {
      setRequestLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/swaps",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            itemId: id,
            offeredItemId: selectedItemId,
            message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to send swap request.");
        return;
      }

      alert("Swap request sent successfully!");

      setSelectedItemId("");
      setMessage("");
    } catch (error) {
      console.error("Swap request error:", error);
      alert("Unable to connect to the server.");
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="item-not-found">
        <h1>Loading Item...</h1>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="item-not-found">
        <h1>Item Not Found</h1>
        <p>{error}</p>
        <Link to="/listings">Back to Listings</Link>
      </div>
    );
  }

  return (
    <div className="item-details-page">
      <Link to="/listings" className="back-link">
        ← Back to Listings
      </Link>

      <div className="item-details-card">
        <div className="item-image-section">
          <img
            src={item.image}
            alt={item.title}
          />
        </div>

        <div className="item-info-section">
          <p className="item-category">
            {item.category}
          </p>

          <h1>{item.title}</h1>

          <p className="item-brand">
            Brand: <strong>{item.brand}</strong>
          </p>

          <div className="item-details-list">
            <p>
              <strong>Size:</strong> {item.size}
            </p>

            <p>
              <strong>Condition:</strong> {item.condition}
            </p>

            <p>
              <strong>Location:</strong> 📍 {item.location}
            </p>
          </div>

          <p className="item-description">
            This clothing item is available for swapping.
            Send your own clothing item as an offer and
            discuss the exchange with the owner.
          </p>

          <div className="item-value">
            Estimated Value:{" "}
            <strong>₹{item.value}</strong>
          </div>

          <div className="swap-request-box">
            <h3>Request a Swap</h3>

            {myItems.length === 0 ? (
              <p>
                You don't have another available clothing item
                to offer for this swap.
              </p>
            ) : (
              <>
                <div className="form-group">
                  <label>Choose Your Item to Offer</label>

                  <select
                    value={selectedItemId}
                    onChange={(event) =>
                      setSelectedItemId(event.target.value)
                    }
                  >
                    <option value="">
                      Select your clothing item
                    </option>

                    {myItems.map((myItem) => (
                      <option
                        key={myItem._id}
                        value={myItem._id}
                      >
                        {myItem.title} · ₹{myItem.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Message</label>

                  <textarea
                    placeholder="Write a message to the owner..."
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    rows="4"
                  />
                </div>

                <button
                  className="swap-request-btn"
                  onClick={handleSwapRequest}
                  disabled={requestLoading}
                >
                  {requestLoading
                    ? "Sending Request..."
                    : "Send Swap Request"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;