"use client";
import React, { useState, useEffect } from 'react';
import { getAllBrands, createBrand, updateBrand, deactivateBrand, reactivateBrand, fetchCategoriesByBrand, createCategory } from "@/services/brandService";
import { IBrandData, ICategoryData } from "@/interfaces/data.interfaces";
import { toast } from 'react-toastify';

const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<IBrandData[]>([]);
  const [categories, setCategories] = useState<ICategoryData[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<IBrandData | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategories, setShowCategories] = useState(true);

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
      const data = await fetchCategoriesByBrand(brandId);
      setCategories(data);
    } catch (error) {
      toast.error("Error fetching categories");
    }
  };

  const handleCreateBrand = async () => {
    try {
      const newBrand: Partial<IBrandData> = { name: newBrandName };
      await createBrand(newBrand);
      toast.success("Brand created successfully");
      setNewBrandName('');
      fetchBrands();
    } catch (error) {
      toast.error("Error creating brand");
    }
  };

  const handleCreateCategory = async () => {
    if (!selectedBrand) {
      toast.error("Please select a brand first");
      return;
    }
    try {
      const newCategory: Partial<ICategoryData> = { name: newCategoryName };
      await createCategory(selectedBrand.id, newCategory);
      toast.success("Category created successfully");
      setNewCategoryName('');
      fetchCategories(selectedBrand.id);
    } catch (error) {
      toast.error("Error creating category");
    }
  };

  const handleUpdateBrand = async (brandId: number, updatedBrand: IBrandData) => {
    try {
      await updateBrand(brandId, updatedBrand);
      toast.success("Brand updated successfully");
      fetchBrands();
    } catch (error) {
      toast.error("Error updating brand");
      console.error(error);
    }
  };

  const handleDeactivateBrand = async (brandId: number) => {
    try {
      await deactivateBrand(brandId);
      toast.success("Brand deactivated successfully");
      fetchBrands();
    } catch (error) {
      toast.error("Error deactivating brand");
    }
  };

  const handleReactivateBrand = async (brandId: number) => {
    try {
      await reactivateBrand(brandId);
      toast.success("Brand reactivated successfully");
      fetchBrands();
    } catch (error) {
      toast.error("Error reactivating brand");
    }
  };

  const handleSelectBrand = (brand: IBrandData) => {
    setSelectedBrand(brand);
    fetchCategories(brand.id);
    setShowCategories(true);
  };

  const handleToggleCategories = () => {
    setShowCategories(!showCategories);
  };

  // You'll need to implement these functions
  const handleUpdateCategory = async (categoryId: number, updatedCategory: ICategoryData) => {
    // Implementation
  };

  const handleDeactivateCategory = async (categoryId: number) => {
    // Implementation
  };

  const handleReactivateCategory = async (categoryId: number) => {
    // Implementation
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Brands</h1>
      <div className="mb-6">
        <input 
          type="text" 
          value={newBrandName} 
          onChange={(e) => setNewBrandName(e.target.value)} 
          placeholder="New Brand Name" 
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" 
        />
        <button 
          onClick={handleCreateBrand} 
          className="ml-2 p-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Create Brand
        </button>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Active</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id} className={`text-center ${selectedBrand?.id === brand.id ? 'bg-blue-100' : ''}`}>
              <td className="py-2">{brand.name}</td>
              <td className="py-2">{brand.active ? 'Yes' : 'No'}</td>
              <td className="py-2 flex justify-center space-x-2">
                <button onClick={() => handleUpdateBrand(brand.id, { ...brand, name: prompt("New name:", brand.name) || brand.name })} className="bg-yellow-500 p-2 rounded-md hover:bg-yellow-600 border border-yellow-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-pencil-square" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/></svg>
                </button>
                <button onClick={() => handleDeactivateBrand(brand.id)} className="bg-red-500 p-2 rounded-md hover:bg-red-600 border border-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>
                </button>
                <button onClick={() => handleReactivateBrand(brand.id)} className="bg-green-500 p-2 rounded-md hover:bg-green-600 border border-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 1 0-.908-.418A6 6 0 1 0 8 2v1z"/><path d="M8 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 1 8 1z"/><path fillRule="evenodd" d="M8 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 1 8 0z"/></svg>
                </button>
                <button onClick={() => handleSelectBrand(brand)} className="bg-blue-500 p-2 rounded-md hover:bg-blue-600 border border-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-eye" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM8 13c-3.866 0-7-4-7-5s3.134-5 7-5 7 4 7 5-3.134 5-7 5z"/><path d="M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M8 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedBrand && showCategories && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Categories for {selectedBrand.name}</h2>
            <button 
              onClick={handleToggleCategories}
              className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 border border-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
              </svg>
            </button>
          </div>
          <div className="mb-4">
            <input 
              type="text" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              placeholder="New Category Name" 
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" 
            />
            <button 
              onClick={handleCreateCategory} 
              className="ml-2 p-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
              Create Category
            </button>
          </div>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Active</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="text-center">
                  <td className="py-2">{category.name}</td>
                  <td className="py-2">{category.active ? 'Yes' : 'No'}</td>
                  <td className="py-2 flex justify-center space-x-2">
                    <button onClick={() => handleUpdateCategory(category.id, { ...category, name: prompt("New name:", category.name) || category.name })} className="bg-yellow-500 p-2 rounded-md hover:bg-yellow-600 border border-yellow-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-pencil-square" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/></svg>
                    </button>
                    <button onClick={() => handleDeactivateCategory(category.id)} className="bg-red-500 p-2 rounded-md hover:bg-red-600 border border-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>
                    </button>
                    <button onClick={() => handleReactivateCategory(category.id)} className="bg-green-500 p-2 rounded-md hover:bg-green-600 border border-green-600">
                      <svg xmlns="http://www.w3.org
/2000/svg" width="16" height="16" fill="black" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 1 0-.908-.418A6 6 0 1 0 8 2v1z"/><path d="M8 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 1 8 1z"/><path fillRule="evenodd" d="M8 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 1 8 0z"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BrandsPage;