import React, { useState } from "react";
import api from "../services/api";

const AdminAddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerDay: "",
    image: null,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.name || !formData.pricePerDay || !formData.image) {
      setError("Please fill all required fields");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("pricePerDay", formData.pricePerDay);
    data.append("image", formData.image);

    try {
      const res = await api.post("/admin/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Product added successfully!");
      setFormData({
        name: "",
        description: "",
        pricePerDay: "",
        image: null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-pink-600">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
        <input
          type="number"
          name="pricePerDay"
          placeholder="Price per day"
          value={formData.pricePerDay}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
          min="1"
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full"
          required
        />
        <button
          type="submit"
          className="bg-pink-600 text-white py-2 px-6 rounded hover:bg-pink-700"
        >
          Add Product
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default AdminAddProduct;
