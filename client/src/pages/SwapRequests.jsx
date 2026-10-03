import { useEffect, useState } from "react";

function SwapRequests() {
  const [activeTab, setActiveTab] = useState("sent");

  const [sentRequests, setSentRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const fetchRequests = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [sentResponse, incomingResponse] = await Promise.all([
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

      const sentData = await sentResponse.json();
      const incomingData = await incomingResponse.json();

      if (!sentResponse.ok) {
        throw new Error(
          sentData.message || "Unable to fetch sent requests."
        );
      }

      if (!incomingResponse.ok) {
        throw new Error(
          incomingData.message ||
            "Unable to fetch incoming requests."
        );
      }

      setSentRequests(sentData.requests || []);
      setIncomingRequests(incomingData.requests || []);
    } catch (error) {
      console.error("Fetch swap requests error:", error);
      alert("Unable to load swap requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateRequestStatus = async (requestId, status) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      setActionLoading(requestId);

      const response = await fetch(
        `https://clothing-swap-backend-efmk.onrender.com/api/swaps/${requestId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to update request.");
        return;
      }

      alert(
        `Swap request ${status.toLowerCase()} successfully!`
      );

      await fetchRequests();
    } catch (error) {
      console.error("Update request error:", error);
      alert("Unable to connect to the server.");
    } finally {
      setActionLoading("");
    }
  };

  const getUserName = (user) => {
    if (!user) {
      return "Unknown User";
    }

    return user.name || "Unknown User";
  };

  const getItemName = (item) => {
    if (!item) {
      return "Unknown Item";
    }

    return item.title || "Unknown Item";
  };

  const getItemValue = (item) => {
    if (!item) {
      return 0;
    }

    return item.value || 0;
  };

  return (
    <div className="swap-page">
      <div className="swap-header">
        <div>
          <h1>Swap Requests</h1>
          <p>Manage your clothing exchange requests.</p>
        </div>
      </div>

      <div className="swap-tabs">
        <button
          className={activeTab === "sent" ? "active" : ""}
          onClick={() => setActiveTab("sent")}
        >
          Sent Requests
        </button>

        <button
          className={activeTab === "incoming" ? "active" : ""}
          onClick={() => setActiveTab("incoming")}
        >
          Incoming Requests
        </button>
      </div>

      {loading ? (
        <section className="swap-list">
          <p>Loading swap requests...</p>
        </section>
      ) : (
        <>
          {activeTab === "sent" && (
            <section className="swap-list">
              {sentRequests.length === 0 ? (
                <p>No sent swap requests found.</p>
              ) : (
                sentRequests.map((request) => (
                  <div
                    className="swap-card"
                    key={request._id}
                  >
                    <div>
                      <h3>
                        {getItemName(request.item)}
                      </h3>

                      <p>
                        Owner:{" "}
                        <strong>
                          {getUserName(request.owner)}
                        </strong>
                      </p>

                      <p>
                        You offered:{" "}
                        <strong>
                          {getItemName(request.offeredItem)}
                        </strong>
                      </p>

                      <p>
                        Your item value:{" "}
                        <strong>
                          ₹{getItemValue(request.offeredItem)}
                        </strong>
                      </p>

                      {request.message && (
                        <p>
                          Message:{" "}
                          <strong>{request.message}</strong>
                        </p>
                      )}
                    </div>

                    <span
                      className={`status-badge ${request.status.toLowerCase()}`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))
              )}
            </section>
          )}

          {activeTab === "incoming" && (
            <section className="swap-list">
              {incomingRequests.length === 0 ? (
                <p>No incoming swap requests found.</p>
              ) : (
                incomingRequests.map((request) => (
                  <div
                    className="swap-card"
                    key={request._id}
                  >
                    <div>
                      <h3>
                        {getItemName(request.item)}
                      </h3>

                      <p>
                        Requested by:{" "}
                        <strong>
                          {getUserName(request.requester)}
                        </strong>
                      </p>

                      <p>
                        They offered:{" "}
                        <strong>
                          {getItemName(request.offeredItem)}
                        </strong>
                      </p>

                      <p>
                        Offered item value:{" "}
                        <strong>
                          ₹{getItemValue(request.offeredItem)}
                        </strong>
                      </p>

                      {request.message && (
                        <p>
                          Message:{" "}
                          <strong>{request.message}</strong>
                        </p>
                      )}
                    </div>

                    <div className="request-actions">
                      {request.status === "Pending" ? (
                        <>
                          <button
                            className="accept-btn"
                            disabled={
                              actionLoading === request._id
                            }
                            onClick={() =>
                              updateRequestStatus(
                                request._id,
                                "Accepted"
                              )
                            }
                          >
                            {actionLoading === request._id
                              ? "Updating..."
                              : "Accept"}
                          </button>

                          <button
                            className="reject-btn"
                            disabled={
                              actionLoading === request._id
                            }
                            onClick={() =>
                              updateRequestStatus(
                                request._id,
                                "Rejected"
                              )
                            }
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span
                          className={`status-badge ${request.status.toLowerCase()}`}
                        >
                          {request.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default SwapRequests;