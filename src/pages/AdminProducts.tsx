import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "@/Config/Api";
import Navbar from "@/components/Navbar";
import ProductsTable from "@/components/ProductsTable";
import ProductFormModal from "@/components/ProductFormModal";

export interface Product {
  id: number;
  category: string;
  product_name: string;
  material: string;
  color: string;
  available_stock: number;
  rating: number;
  original_price: number;
  discount: number;
  sale_price: number;
  description: string;
  dimensions: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [formLoading, setFormLoading] =
    useState(false);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/products`
      );

      setProducts(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (
    formData: FormData
  ) => {
    try {
      setFormLoading(true);

      await axios.post(
        `${BASE_URL}/api/products`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      await fetchProducts();

      setIsModalOpen(false);

      alert("Product Added Successfully");
    } catch (err) {
      console.log(err);
      alert("Failed to add product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditProduct = async (
    formData: FormData
  ) => {
    if (!editingProduct) return;

    try {
      setFormLoading(true);

      await axios.put(
        `${BASE_URL}/api/products/${editingProduct.id}`,
        Object.fromEntries(formData)
      );

      await fetchProducts();

      setEditingProduct(null);
      setIsModalOpen(false);

      alert("Product Updated Successfully");
    } catch (err) {
      console.log(err);
      alert("Failed to update product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (
    id: number
  ) => {
    if (
      !window.confirm(
        "Are you sure want to delete?"
      )
    )
      return;

    try {
      await axios.delete(
        `${BASE_URL}/api/products/${id}`
      );

      await fetchProducts();

      alert("Deleted Successfully");
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold">
              Products
            </h1>

            <p className="text-gray-500">
              Manage Products
            </p>
          </div>
        </div>

        <ProductsTable
          products={products}
          loading={loading}
          onAdd={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          onEdit={(product) => {
            setEditingProduct(product);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteProduct}
        />

        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={
            editingProduct
              ? handleEditProduct
              : handleAddProduct
          }
          initialData={editingProduct}
          loading={formLoading}
        />
      </div>
    </div>
  );
};

export default AdminProducts;