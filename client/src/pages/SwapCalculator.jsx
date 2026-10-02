import { useState } from "react";

function SwapCalculator() {
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [estimatedValue, setEstimatedValue] = useState(null);

  const calculateValue = () => {
    if (!category || !brand || !condition) {
      alert("Please select category, brand and condition.");
      return;
    }

    const categoryValues = {
      shirts: 700,
      dresses: 1000,
      jackets: 1200,
      hoodies: 900,
    };

    const brandMultiplier = {
      regular: 1,
      premium: 1.3,
      luxury: 1.6,
    };

    const conditionMultiplier = {
      new: 1,
      excellent: 0.9,
      good: 0.7,
      fair: 0.5,
    };

    const baseValue = categoryValues[category];
    const brandValue = brandMultiplier[brand];
    const conditionValue = conditionMultiplier[condition];

    const finalValue = Math.round(
      baseValue * brandValue * conditionValue
    );

    setEstimatedValue(finalValue);
  };

  return (
    <div className="calculator-page">
      <div className="calculator-card">
        <div className="calculator-header">
          <p>Swap Tool</p>

          <h1>Clothing Value Calculator</h1>

          <span>
            Estimate a fair swap value for your clothing item.
          </span>
        </div>

        <div className="calculator-form">
          <div className="form-group">
            <label>Clothing Category</label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              <option value="">Select category</option>
              <option value="shirts">Shirt</option>
              <option value="dresses">Dress</option>
              <option value="jackets">Jacket</option>
              <option value="hoodies">Hoodie</option>
            </select>
          </div>

          <div className="form-group">
            <label>Brand Type</label>

            <select
              value={brand}
              onChange={(event) =>
                setBrand(event.target.value)
              }
            >
              <option value="">Select brand type</option>
              <option value="regular">Regular Brand</option>
              <option value="premium">Premium Brand</option>
              <option value="luxury">Luxury Brand</option>
            </select>
          </div>

          <div className="form-group">
            <label>Condition</label>

            <select
              value={condition}
              onChange={(event) =>
                setCondition(event.target.value)
              }
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>

          <button
            className="calculate-btn"
            onClick={calculateValue}
          >
            Calculate Estimated Value
          </button>
        </div>

        {estimatedValue !== null && (
          <div className="calculator-result">
            <p>Estimated Swap Value</p>

            <h2>₹{estimatedValue}</h2>

            <span>
              This is an estimated value based on the
              selected category, brand and condition.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default SwapCalculator;