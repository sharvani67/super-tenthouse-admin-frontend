import React, {
  useEffect,
  useState,
} from "react";
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

const ProductFormModal: React.FC<
  ProductFormModalProps
> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const [form, setForm] = useState({
    category_id: "",
    product_name: "",
    material: "",
    color: "",
    available_stock: "",
    rating: "",
    original_price: "",
    discount: "",
    description: "",
    dimensions: "",
  });

  const [images, setImages] = useState<
    File[]
  >([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/categories`
      );

      setCategories(res.data);
    } catch (error) {
      console.error(
        "Failed to fetch categories",
        error
      );
    }
  };

  fetchCategories();
}, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        category_id:
          initialData.category_id || "",
        product_name:
          initialData.product_name ||
          "",
        material:
          initialData.material || "",
        color:
          initialData.color || "",
        available_stock:
          initialData.available_stock ||
          "",
        rating:
          initialData.rating || "",
        original_price:
          initialData.original_price ||
          "",
        discount:
          initialData.discount || "",
        description:
          initialData.description ||
          "",
        dimensions:
          initialData.dimensions ||
          "",
      });
    }
  }, [initialData]);

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const formData = new FormData();

    Object.entries(form).forEach(
      ([key, value]) => {
        formData.append(key, value);
      }
    );

    images.forEach((image) => {
      formData.append(
        "images",
        image
      );
    });

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center mb-6">

          <h3 className="text-xl font-semibold">
            {initialData
              ? "Edit Product"
              : "Add Product"}
          </h3>

          <button
            onClick={onClose}
          >
            <X size={22} />
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >

<select
  className="border p-2 rounded-lg"
  value={form.category_id}
  onChange={(e) =>
    setForm({
      ...form,
      category_id: e.target.value,
    })
  }
>
  <option value="">
    Select Category
  </option>

  {categories.map((category) => (
    <option
      key={category.id}
      value={category.id}
    >
      {category.category_name}
    </option>
  ))}
</select>

          <input
            placeholder="Product Name"
            className="border p-2 rounded-lg"
            value={
              form.product_name
            }
            onChange={(e) =>
              setForm({
                ...form,
                product_name:
                  e.target.value,
              })
            }
          />

          <input
            placeholder="Material"
            className="border p-2 rounded-lg"
            value={form.material}
            onChange={(e) =>
              setForm({
                ...form,
                material:
                  e.target.value,
              })
            }
          />

          <input
            placeholder="Color"
            className="border p-2 rounded-lg"
            value={form.color}
            onChange={(e) =>
              setForm({
                ...form,
                color:
                  e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Stock"
            className="border p-2 rounded-lg"
            value={
              form.available_stock
            }
            onChange={(e) =>
              setForm({
                ...form,
                available_stock:
                  e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Rating"
            className="border p-2 rounded-lg"
            value={form.rating}
            onChange={(e) =>
              setForm({
                ...form,
                rating:
                  e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Original Price"
            className="border p-2 rounded-lg"
            value={
              form.original_price
            }
            onChange={(e) =>
              setForm({
                ...form,
                original_price:
                  e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Discount"
            className="border p-2 rounded-lg"
            value={form.discount}
            onChange={(e) =>
              setForm({
                ...form,
                discount:
                  e.target.value,
              })
            }
          />

          <input
            placeholder="Dimensions"
            className="border p-2 rounded-lg md:col-span-2"
            value={
              form.dimensions
            }
            onChange={(e) =>
              setForm({
                ...form,
                dimensions:
                  e.target.value,
              })
            }
          />

          <textarea
            rows={4}
            placeholder="Description"
            className="border p-2 rounded-lg md:col-span-2"
            value={
              form.description
            }
            onChange={(e) =>
              setForm({
                ...form,
                description:
                  e.target.value,
              })
            }
          />

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium">
              Product Images
            </label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setImages(
                  Array.from(
                    e.target.files ||
                      []
                  )
                )
              }
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-4">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#0c2d67] text-white rounded-lg"
            >
              {loading
                ? "Saving..."
                : initialData
                ? "Update Product"
                : "Add Product"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;