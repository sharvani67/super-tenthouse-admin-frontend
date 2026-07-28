import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import BASE_URL from "@/Config/Api";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  initialData?: any;
  loading?: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const [form, setForm] = useState({
    product_category_id: "", // Changed from category_id
    product_name: "",
    material: "",
    color: "",
    available_stock: "",
    rating: "",
    price: "", // Changed from original_price
    discount: "",
    description: "",
    dimensions: "",
    product_code: "",
    product_brand: "",
    weight: "",
    specifications: "",
    warranty: "",
    care_instructions: "",
    is_active: "1",
  });

  const [images, setImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/categories`);
        setCategories(res.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        product_category_id: initialData.product_category_id || initialData.category_id || "",
        product_name: initialData.product_name || "",
        material: initialData.material || "",
        color: initialData.color || "",
        available_stock: initialData.available_stock || "",
        rating: initialData.rating || "",
        price: initialData.price || initialData.original_price || "",
        discount: initialData.discount || "",
        description: initialData.product_description || initialData.description || "",
        dimensions: initialData.dimensions || "",
        product_code: initialData.product_code || "",
        product_brand: initialData.product_brand || "",
        weight: initialData.weight || "",
        specifications: initialData.specifications || "",
        warranty: initialData.warranty || "",
        care_instructions: initialData.care_instructions || "",
        is_active: initialData.is_active !== undefined ? String(initialData.is_active) : "1",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    // Append all form fields
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    });

    // Append images
    images.forEach((image) => {
      formData.append("images", image);
    });

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {initialData ? "Edit Product" : "Add Product"}
          </h3>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Dropdown */}
          <select
            className="border p-2 rounded-lg"
            value={form.product_category_id}
            onChange={(e) =>
              setForm({ ...form, product_category_id: e.target.value })
            }
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))}
          </select>

          {/* Product Name */}
          <input
            placeholder="Product Name"
            className="border p-2 rounded-lg"
            value={form.product_name}
            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            required
          />

          {/* Product Code */}
          <input
            placeholder="Product Code (SKU)"
            className="border p-2 rounded-lg"
            value={form.product_code}
            onChange={(e) => setForm({ ...form, product_code: e.target.value })}
          />

          {/* Product Brand */}
          <input
            placeholder="Brand"
            className="border p-2 rounded-lg"
            value={form.product_brand}
            onChange={(e) => setForm({ ...form, product_brand: e.target.value })}
          />

          {/* Material */}
          <input
            placeholder="Material"
            className="border p-2 rounded-lg"
            value={form.material}
            onChange={(e) => setForm({ ...form, material: e.target.value })}
          />

          {/* Color */}
          <input
            placeholder="Color"
            className="border p-2 rounded-lg"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />

          {/* Price (renamed from original_price) */}
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            className="border p-2 rounded-lg"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />

          {/* Discount */}
          <input
            type="number"
            step="0.01"
            placeholder="Discount (%)"
            className="border p-2 rounded-lg"
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
          />

          {/* Available Stock */}
          <input
            type="number"
            placeholder="Stock"
            className="border p-2 rounded-lg"
            value={form.available_stock}
            onChange={(e) => setForm({ ...form, available_stock: e.target.value })}
            required
          />

          {/* Weight */}
          <input
            placeholder="Weight (kg)"
            className="border p-2 rounded-lg"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />

          {/* Dimensions */}
          <input
            placeholder="Dimensions (LxWxH)"
            className="border p-2 rounded-lg md:col-span-2"
            value={form.dimensions}
            onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
          />

          {/* Specifications */}
          <textarea
            rows={2}
            placeholder="Specifications (JSON format)"
            className="border p-2 rounded-lg md:col-span-2"
            value={form.specifications}
            onChange={(e) => setForm({ ...form, specifications: e.target.value })}
          />

          {/* Description */}
          <textarea
            rows={3}
            placeholder="Description"
            className="border p-2 rounded-lg md:col-span-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Warranty */}
          <input
            placeholder="Warranty"
            className="border p-2 rounded-lg"
            value={form.warranty}
            onChange={(e) => setForm({ ...form, warranty: e.target.value })}
          />

          {/* Care Instructions */}
          <input
            placeholder="Care Instructions"
            className="border p-2 rounded-lg"
            value={form.care_instructions}
            onChange={(e) => setForm({ ...form, care_instructions: e.target.value })}
          />

          {/* Active Status */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active === "1"}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked ? "1" : "0" })
                }
              />
              <span>Active (visible to customers)</span>
            </label>
          </div>

          {/* Rating (hidden or optional) */}
          <input
            type="hidden"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
          />

          {/* Images Upload */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium">Product Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages(Array.from(e.target.files || []))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {images.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {images.length} image(s) selected
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#0c2d67] text-white rounded-lg hover:bg-[#173d79] disabled:opacity-50"
            >
              {loading ? "Saving..." : initialData ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;