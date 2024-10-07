import React, { useState, useEffect } from 'react';
import { ICategoryData, IBrandData } from '@/interfaces/data.interfaces';
import { toast } from 'react-toastify';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryId: number, categoryName: string) => void;
  category: ICategoryData | null;
  brands: IBrandData[];
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ isOpen, onClose, onSubmit, category, brands }) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);

  useEffect(() => {
    if (category) {
      setCategoryName(category.name);
      setSelectedBrand(category.brandId);
    }
  }, [category]);

  const handleSubmit = () => {
    if (categoryName.trim() === '') {
      toast.error("Category name cannot be empty");
      return;
    }

    onSubmit(category!.id, categoryName);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setCategoryName('');
    setSelectedBrand(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h2 className="text-2xl mb-4">Edit Category</h2>
        {category && (
          <div>
            <div className="mb-4">
              <label className="block text-gray-700">Brand</label>
              <input
                type="text"
                value={brands.find(brand => brand.id === selectedBrand)?.name || ''}
                disabled
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Category Name</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md">Cancel</button>
              <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded-md">Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditCategoryModal;