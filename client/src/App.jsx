import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Listings from "./pages/Listings";
import ItemDetails from "./pages/ItemDetails";
import SwapRequests from "./pages/SwapRequests";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import SwapCalculator from "./pages/SwapCalculator";
import AddClothing from "./pages/AddClothing";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Default page */}
        <Route
          path="/"
          element={<Navigate to="/listings" replace />}
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Clothing marketplace */}
        <Route path="/listings" element={<Listings />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/add-clothing" element={<AddClothing />} />

        {/* Swap features */}
        <Route
          path="/swap-requests"
          element={<SwapRequests />}
        />

        <Route path="/chat" element={<Chat />} />

        {/* User & Admin */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />

        {/* Calculator */}
        <Route
          path="/calculator"
          element={<SwapCalculator />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;