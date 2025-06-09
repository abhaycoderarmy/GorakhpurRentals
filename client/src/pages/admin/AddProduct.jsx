import React, { useState } from "react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    pricePerDay: "",
    category: "",
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (image) data.append("image", image);

    try {
      await api.post("/products", data);
      setSuccess("Product added successfully!");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white shadow rounded">
      <h2 className="text-2xl font-bold text-center text-pink-600 mb-4">Add New Lehenga</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="number"
          name="pricePerDay"
          placeholder="Price per day"
          value={form.pricePerDay}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category (e.g., Bridal, Festive)"
          value={form.category}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
          required
        />
        <button
          type="submit"
          className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
