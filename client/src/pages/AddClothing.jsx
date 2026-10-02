import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddClothing() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [value, setValue] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !title ||
      !brand ||
      !category ||
      !size ||
      !condition ||
      !value ||
      !location ||
      !image
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before adding a clothing listing.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/clothing",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            brand,
            category,
            size,
            condition,
            value: Number(value),
            location,
            image,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to add clothing listing.");
        return;
      }

      alert("Clothing listing added successfully!");

      setTitle("");
      setBrand("");
      setCategory("");
      setSize("");
      setCondition("");
      setValue("");
      setLocation("");
      setImage("");

      navigate("/listings");
    } catch (error) {
      console.error("Add clothing error:", error);
      alert("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-clothing-page">
      <div className="add-clothing-card">
        <div className="add-clothing-header">
          <p>Add Listing</p>
          <h1>List Your Clothing</h1>
          <span>
            Add details about the clothing item you want to swap.
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Clothing Name</label>
            <input
              type="text"
              placeholder="e.g. Denim Jacket"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Brand</label>
            <input
              type="text"
              placeholder="e.g. Levi's"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Select category</option>
              <option value="shirts">Shirt</option>
              <option value="dresses">Dress</option>
              <option value="jackets">Jacket</option>
              <option value="hoodies">Hoodie</option>
            </select>
          </div>

          <div className="form-group">
            <label>Size</label>
            <select
              value={size}
              onChange={(event) => setSize(event.target.value)}
            >
              <option value="">Select size</option>
              <option value="S">Small</option>
              <option value="M">Medium</option>
              <option value="L">Large</option>
              <option value="XL">XL</option>
            </select>
          </div>

          <div className="form-group">
            <label>Condition</label>
            <select
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
            >
              <option value="">Select condition</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estimated Value (₹)</label>
            <input
              type="number"
              placeholder="e.g. 1200"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="e.g. Kolkata"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              placeholder="Paste clothing image URL"
              value={image}
              onChange={(event) => setImage(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "Adding Listing..." : "Add Clothing Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddClothing;