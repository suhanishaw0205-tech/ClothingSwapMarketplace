import { useEffect, useState } from "react";

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [chatUser, setChatUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const getCurrentUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch (error) {
      console.error("User data error:", error);
      return null;
    }
  };

  const fetchChat = async () => {
    const token = localStorage.getItem("token");
    const currentUser = getCurrentUser();

    if (!token || !currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const incomingResponse = await fetch(
        "http://localhost:5000/api/swaps/incoming",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const sentResponse = await fetch(
        "http://localhost:5000/api/swaps/sent",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const incomingData = await incomingResponse.json();
      const sentData = await sentResponse.json();

      if (!incomingResponse.ok) {
        throw new Error(
          incomingData.message ||
            "Unable to fetch incoming requests."
        );
      }

      if (!sentResponse.ok) {
        throw new Error(
          sentData.message ||
            "Unable to fetch sent requests."
        );
      }

      const incomingAccepted =
        (incomingData.requests || []).find(
          (request) => request.status === "Accepted"
        );

      const sentAccepted =
        (sentData.requests || []).find(
          (request) => request.status === "Accepted"
        );

      let otherUser = null;

      if (incomingAccepted) {
        otherUser = incomingAccepted.requester;
      } else if (sentAccepted) {
        otherUser = sentAccepted.owner;
      }

      if (!otherUser) {
        setChatUser(null);
        setMessages([]);
        return;
      }

      setChatUser(otherUser);

      const messagesResponse = await fetch(
        `http://localhost:5000/api/messages/${otherUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const messagesData = await messagesResponse.json();

      if (!messagesResponse.ok) {
        throw new Error(
          messagesData.message ||
            "Unable to fetch chat messages."
        );
      }

      setMessages(messagesData.messages || []);
    } catch (error) {
      console.error("Fetch chat error:", error);
      alert("Unable to load chat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) {
      return;
    }

    if (!chatUser) {
      alert("No active swap conversation found.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      setSending(true);

      const response = await fetch(
        "http://localhost:5000/api/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            receiverId: chatUser._id,
            text: message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to send message.");
        return;
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        data.chatMessage,
      ]);

      setMessage("");
    } catch (error) {
      console.error("Send message error:", error);
      alert("Unable to connect to the server.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const currentUser = getCurrentUser();

  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-header">
            <div>
              <h1>Swap Chat</h1>
              <p>Loading conversation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chatUser) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-header">
            <div>
              <h1>Swap Chat</h1>
              <p>No active swap conversation found.</p>
            </div>
          </div>

          <div className="messages-area">
            <p>
              Accept a swap request to start a conversation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <div>
            <h1>Swap Chat</h1>
            <p>
              Negotiating with {chatUser.name}
            </p>
          </div>

          <span className="online-status">
            ● Active Swap
          </span>
        </div>

        <div className="messages-area">
          {messages.length === 0 ? (
            <p>
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => {
              const isOwnMessage =
                msg.sender &&
                currentUser &&
                msg.sender._id ===
                  (currentUser.id || currentUser._id);

              return (
                <div
                  key={msg._id}
                  className={`message-row ${
                    isOwnMessage
                      ? "own-message"
                      : "other-message"
                  }`}
                >
                  <div className="message-bubble">
                    {!isOwnMessage && (
                      <strong>
                        {msg.sender?.name || chatUser.name}
                      </strong>
                    )}

                    <p>{msg.text}</p>

                    <span>
                      {new Date(
                        msg.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="message-input-area">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            disabled={sending}
          />

          <button
            onClick={sendMessage}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;