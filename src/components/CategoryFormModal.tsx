// import React, { useState, useEffect } from 'react';
// import { X } from 'lucide-react';

// interface CategoryFormModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: { category_name: string }) => void;
//   initialData?: { id: number; category_name: string } | null;
//   loading?: boolean;
// }

// const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   initialData,
//   loading = false,
// }) => {
//   const [categoryName, setCategoryName] = useState('');

//   useEffect(() => {
//     if (initialData) {
//       setCategoryName(initialData.category_name);
//     } else {
//       setCategoryName('');
//     }
//   }, [initialData, isOpen]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (categoryName.trim()) {
//       onSubmit({ category_name: categoryName.trim() });
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       {/* Backdrop */}
//       <div 
//         className="absolute inset-0 bg-black bg-opacity-50"
//         onClick={onClose}
//       />

//       {/* Modal */}
//       <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-xl font-semibold text-gray-800">
//             {initialData ? 'Edit Category' : 'Add New Category'}
//           </h3>
//           <button
//             onClick={onClose}
//             className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Category Name
//             </label>
//             <input
//               type="text"
//               value={categoryName}
//               onChange={(e) => setCategoryName(e.target.value)}
//               placeholder="Enter category name"
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
//               autoFocus
//             />
//           </div>

//           {/* Actions */}
//           <div className="flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading || !categoryName.trim()}
//               className="px-4 py-2 bg-[#0c2d67] text-white rounded-lg hover:bg-[#1a3f7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Saving...' : initialData ? 'Update' : 'Add'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CategoryFormModal;



import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import BASE_URL from '@/Config/Api';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData | { category_name: string; image?: string }) => void;
  initialData?: { id?: number; category_name: string; image?: string } | null;
  loading?: boolean;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImage, setExistingImage] = useState<string>('');
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Helper function to get full image URL
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('data:image')) return imagePath;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('uploads/')) return `${BASE_URL}/${imagePath}`;
    if (imagePath.startsWith('/uploads/')) return `${BASE_URL}${imagePath}`;
    return `${BASE_URL}/${imagePath}`;
  };

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCategoryName(initialData.category_name || '');
        setExistingImage(initialData.image || '');
        setImageError(false);
        
        // Set preview for existing image
        if (initialData.image) {
          const imageUrl = getImageUrl(initialData.image);
          console.log('Setting existing image preview:', imageUrl); // Debug log
          setImagePreview(imageUrl);
        } else {
          setImagePreview('');
        }
        
        setImageFile(null);
        setRemoveImage(false);
      } else {
        // Reset for new category
        setCategoryName('');
        setImageFile(null);
        setImagePreview('');
        setExistingImage('');
        setRemoveImage(false);
        setImageError(false);
      }
    }
  }, [initialData, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveImage(false);
      setImageError(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (initialData?.image) {
      setRemoveImage(true);
    }
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    console.error('Failed to load image:', imagePreview);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (imageFile) {
      // If there's a new file, use FormData
      const formData = new FormData();
      formData.append('category_name', categoryName);
      formData.append('image', imageFile);
      onSubmit(formData);
    } else {
      // No new file, send JSON
      const data: { category_name: string; image?: string } = {
        category_name: categoryName
      };
      
      // If removing existing image
      if (removeImage) {
        data.image = '';
      } else if (existingImage) {
        // Keep existing image
        data.image = existingImage;
      }
      
      onSubmit(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {initialData ? 'Edit Category' : 'Add New Category'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter category name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image
              </label>
              
              <div className="mt-1">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => document.getElementById('imageUpload')?.click()}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {imageFile ? 'Change Image' : 'Choose Image'}
                  </button>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imageFile && (
                    <span className="text-sm text-gray-600">
                      {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                  {existingImage && !imageFile && !removeImage && (
                    <span className="text-sm text-green-600">
                      Current image kept
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF, WEBP (Max 5MB)
                </p>
              </div>

              {/* Image Preview */}
              {(imagePreview && !removeImage) && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
                    onError={handleImageError}
                    onLoad={() => console.log('Image loaded successfully:', imagePreview)}
                  />
                  {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <span className="text-xs text-red-500">Failed to load</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Show placeholder when no image */}
              {(!imagePreview || removeImage) && (
                <div className="mt-3 h-32 w-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-400">No image</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading || !categoryName.trim()}
              >
                {loading ? 'Saving...' : initialData ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;