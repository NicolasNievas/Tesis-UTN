"use client";
import React, { useState, useEffect } from 'react';
import { createCategory, desactiveCategory, updateCategory, reactiveCategory, fetchAllCategoriesByBrand } from "@/services/AdminCategoryService";
import { getAllBrands } from "@/services/AdminBrandService";
import { IBrandData, ICategoryData } from "@/interfaces/data.interfaces";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import EditCategoryModal from '@/components/organisms/EditCategoryModal';
import { withAdmin } from '@/hoc/isAdmin';
import Line from '@/components/atoms/Line';

const CategoriesPage: React.FC = () => {
  const [brands, setBrands] = useState<IBrandData[]>([]);
  const [categories, setCategories] = useState<ICategoryData[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategoryData | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await getAllBrands();
      setBrands(data);
    } catch (error) {
      toast.error("Error fetching brands");
    }
  };

  const fetchCategories = async (brandId: number) => {
    try {
      const data = await fetchAllCategoriesByBrand(brandId);
      setCategories(data);
    } catch (error) {
      toast.error("Error fetching categories");
    }
  };

  const handleCreateCategory = async () => {
    if (!selectedBrand) {
      toast.error("Please select a brand first");
      return;
    }

    try {
      const newCategory: Partial<ICategoryData> = { name: newCategoryName };
      await createCategory(selectedBrand, newCategory);
      toast.success("Category created successfully");
      setNewCategoryName('');
      fetchCategories(selectedBrand);
    } catch (error) {
      toast.error("Error creating category");
    }
  };

  const handleUpdateCategory = async (categoryId: number, categoryName: string) => {
    if (!selectedBrand) {
      toast.error("Please select a brand first");
      return;
    }

    try {
      await updateCategory(selectedBrand, categoryId, categoryName);
      toast.success("Category updated successfully");
      fetchCategories(selectedBrand);
      closeModal();
    } catch (error) {
      toast.error("Error updating category");
    }
  };

  const handleDeactivateCategory = async (categoryId: number) => {
    try{
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, deactivate it!'
        });

        if(result.isConfirmed) {
            await desactiveCategory(selectedBrand!, categoryId);
            toast.success("Category deactivated successfully");
            fetchCategories(selectedBrand!);
        }
    } catch (error) {
        toast.error("Error deactivating category");
    }
};

  const handleReactivateCategory = async (categoryId: number) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, reactivate it!'
      });

      if (result.isConfirmed) {
        await reactiveCategory(selectedBrand!, categoryId);
        toast.success("Category reactivated successfully");
        fetchCategories(selectedBrand!);
      }
    } catch (error) {
      toast.error("Error reactivating category");
    }
  };

  const handleBrandChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const brandId = Number(event.target.value);
    setSelectedBrand(brandId);
    fetchCategories(brandId);
  };

  const openModal = (category: ICategoryData) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Categories Management</h1>
      <Line />
      <div className="mb-6">
        <select
          value={selectedBrand?.toString() || ""}
          onChange={handleBrandChange}
          className="w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="">Select a brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id.toString()}>
              {brand.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New Category Name"
          className="w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <button
          onClick={handleCreateCategory}
          className="ml-2 p-2 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Add Category
        </button>
      </div>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 text-center">Name</th>
            <th className="py-2 text-center">Active</th>
            <th className="py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 ? (
            categories.map((category) => (
              <tr key={category.id} className="text-center">
                <td className="py-2">{category.name}</td>
                <td className="py-2">{category.active ? "Yes" : "No"}</td>
                <td className="py-2 flex justify-center space-x-2">
                  <button onClick={() => openModal(category)} className="bg-yellow-500 p-2 rounded-md hover:bg-yellow-600 border border-yellow-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-pencil-square" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/></svg>
                  </button>
                  <button onClick={() => handleDeactivateCategory(category.id)} className="bg-red-500 p-2 rounded-md hover:bg-red-600 border border-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>
                  </button>
                  <button onClick={() => handleReactivateCategory(category.id)} className="bg-green-500 p-2 rounded-md hover:bg-green-600 border border-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 1 0-.908-.418A6 6 0 1 0 8 2v1z"/><path d="M8 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 1 8 1z"/><path fillRule="evenodd" d="M8 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 1 8 0z"/></svg>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-600">
                No categories available for the selected brand.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <EditCategoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleUpdateCategory}
        category={selectedCategory}
        brands={brands}
      />
    </div>
  );
};

export default withAdmin(CategoriesPage);