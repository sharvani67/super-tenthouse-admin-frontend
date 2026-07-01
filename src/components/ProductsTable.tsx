import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Search,
} from "lucide-react";

export interface Product {
  id: number;
  category_id: number;
  category_name: string;
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

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  loading?: boolean;
}

const ProductsTable: React.FC<
  ProductsTableProps
> = ({
  products,
  onEdit,
  onDelete,
  onAdd,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] =
    useState("");

 const filteredProducts = products.filter(
  (product) =>
    product.product_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    product.category_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}

      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between gap-4">

          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Products
            </h3>

            <p className="text-sm text-gray-500">
              Total: {products.length} Products
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />
            </div>

            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 bg-[#0c2d67] text-white rounded-lg hover:bg-[#173d79]"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">

          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                ID
              </th>

              <th className="px-4 py-3 text-left">
                Product
              </th>

              <th className="px-4 py-3 text-left">
                Category
              </th>

              <th className="px-4 py-3 text-left">
                Material
              </th>

              <th className="px-4 py-3 text-left">
                Color
              </th>

              <th className="px-4 py-3 text-left">
                Stock
              </th>

              <th className="px-4 py-3 text-left">
                Rating
              </th>

              <th className="px-4 py-3 text-left">
                Original Price
              </th>

              <th className="px-4 py-3 text-left">
                Discount
              </th>

              <th className="px-4 py-3 text-left">
                Sale Price
              </th>

              <th className="px-4 py-3 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={11}
                  className="text-center py-10"
                >
                  Loading Products...
                </td>
              </tr>
            ) : filteredProducts.length ===
              0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="text-center py-10"
                >
                  No Products Found
                </td>
              </tr>
            ) : (
              filteredProducts.map(
                (product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      #{product.id}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      {
                        product.product_name
                      }
                    </td>

                    <td className="px-4 py-3">
                      {product.category_name}
                    </td>

                    <td className="px-4 py-3">
                      {product.material}
                    </td>

                    <td className="px-4 py-3">
                      {product.color}
                    </td>

                    <td className="px-4 py-3">
                      {
                        product.available_stock
                      }
                    </td>

                    <td className="px-4 py-3">
                      ⭐ {product.rating}
                    </td>

                    <td className="px-4 py-3">
                      ₹
                      {
                        product.original_price
                      }
                    </td>

                    <td className="px-4 py-3">
                      ₹
                      {product.discount}
                    </td>

                    <td className="px-4 py-3 font-semibold text-green-600">
                      ₹
                      {
                        product.sale_price
                      }
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            onEdit(
                              product
                            )
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit
                            size={18}
                          />
                        </button>

                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Delete Product?"
                              )
                            ) {
                              onDelete(
                                product.id
                              );
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2
                            size={18}
                          />
                        </button>

                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t bg-gray-50 text-sm text-gray-500">
        Showing {filteredProducts.length} of{" "}
        {products.length} products
      </div>
    </div>
  );
};

export default ProductsTable;