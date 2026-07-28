// import React, { useState } from 'react';
// import { Edit, Trash2, Plus, Search, X } from 'lucide-react';

// interface Category {
//   id: number;
//   category_name: string;
//   created_at?: string;
//   updated_at?: string;
// }

// interface CategoriesTableProps {
//   categories: Category[];
//   onEdit: (category: Category) => void;
//   onDelete: (id: number) => void;
//   onAdd: () => void;
//   loading?: boolean;
// }

// const CategoriesTable: React.FC<CategoriesTableProps> = ({
//   categories,
//   onEdit,
//   onDelete,
//   onAdd,
//   loading = false,
// }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

//   const filteredCategories = categories.filter(category =>
//     category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//       {/* Header */}
//       <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
//             <p className="text-sm text-gray-500">
//               Total: {categories.length} categories
//             </p>
//           </div>
          
//           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//             {/* Search */}
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type="text"
//                 placeholder="Search categories..."
//                 className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67] w-full sm:w-64"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             {/* Add Button */}
//             <button
//               onClick={onAdd}
//               className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0c2d67] text-white rounded-lg hover:bg-[#1a3f7a] transition-colors"
//             >
//               <Plus size={18} />
//               <span>Add Category</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 ID
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Category Name
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Created At
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {loading ? (
//               <tr>
//                 <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
//                   Loading categories...
//                 </td>
//               </tr>
//             ) : filteredCategories.length === 0 ? (
//               <tr>
//                 <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
//                   {searchTerm ? 'No categories found matching your search' : 'No categories available'}
//                 </td>
//               </tr>
//             ) : (
//               filteredCategories.map((category) => (
//                 <tr key={category.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 text-sm text-gray-900">
//                     #{category.id}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-900 font-medium">
//                     {category.category_name}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-500">
//                     {category.created_at ? new Date(category.created_at).toLocaleDateString() : '-'}
//                   </td>
//                   <td className="px-6 py-4 text-sm">
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => onEdit(category)}
//                         className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                         title="Edit"
//                       >
//                         <Edit size={18} />
//                       </button>
//                       <button
//                         onClick={() => {
//                           if (window.confirm(`Are you sure you want to delete "${category.category_name}"?`)) {
//                             onDelete(category.id);
//                           }
//                         }}
//                         className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                         title="Delete"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Footer */}
//       <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
//         <div className="flex justify-between items-center text-sm text-gray-500">
//           <span>Showing {filteredCategories.length} of {categories.length} categories</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CategoriesTable;

import React, { useState } from 'react';
import BASE_URL from '@/Config/Api';

interface Category {
  id: number;
  category_name: string;
  image?: string;
  product_count?: number;
  created_at?: string;
}

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  loading: boolean;
}

// SVG Placeholder as data URI (no external dependencies)
const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23f3f4f6'/%3E%3Crect x='5' y='5' width='40' height='40' fill='%23e5e7eb' rx='4'/%3E%3Ctext x='25' y='28' text-anchor='middle' fill='%239ca3af' font-size='8' font-family='sans-serif'%3ENo%20Img%3C/text%3E%3C/svg%3E`;

const ERROR_PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23fef2f2'/%3E%3Crect x='5' y='5' width='40' height='40' fill='%23fecaca' rx='4'/%3E%3Ctext x='25' y='28' text-anchor='middle' fill='%23dc2626' font-size='8' font-family='sans-serif'%3EError%3C/text%3E%3C/svg%3E`;

const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  onEdit,
  onDelete,
  onAdd,
  loading,
}) => {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Helper function to get the correct image source
  const getImageSrc = (imageData?: string) => {
    if (!imageData) return null;
    
    // If it's already a base64 data URL, use it directly
    if (imageData.startsWith('data:image')) {
      return imageData;
    }
    
    // If it's a full URL (http/https), use it directly
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      return imageData;
    }
    
    // If it's a path (uploads/categories/...), prepend with BASE_URL
    if (imageData.startsWith('uploads/')) {
      return `${BASE_URL}/${imageData}`;
    }
    
    // If it starts with /uploads/, remove the slash and prepend BASE_URL
    if (imageData.startsWith('/uploads/')) {
      return `${BASE_URL}${imageData}`;
    }
    
    // Fallback - treat as relative path
    return `${BASE_URL}/${imageData}`;
  };

  const handleImageError = (categoryId: number) => {
    setImageErrors(prev => ({ ...prev, [categoryId]: true }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Categories</h2>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Category
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => {
                const imageSrc = getImageSrc(category.image);
                const hasError = imageErrors[category.id];
                
                return (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {imageSrc && !hasError ? (
                        <img
                          src={imageSrc}
                          alt={category.category_name}
                          className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            handleImageError(category.id);
                            console.error(`Image failed to load for category ${category.id}:`, category.image);
                            // Use SVG placeholder on error
                            (e.target as HTMLImageElement).src = ERROR_PLACEHOLDER_SVG;
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs border border-gray-200">
                          {hasError ? 'Error' : 'No img'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.category_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category.product_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onEdit(category)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(category.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriesTable;