"use client";
import React, { useState, useEffect } from 'react';
import { getAllBrands, createBrand, updateBrand, deactivateBrand, reactivateBrand } from "@/services/AdminBrandService";
import { IBrandData } from "@/interfaces/data.interfaces";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { withAdmin } from '@/hoc/isAdmin';
import Line from '@/components/atoms/Line';

const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<IBrandData[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<IBrandData | null>(null);
  const [newBrandName, setNewBrandName] = useState('');

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
      const confirm = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action will deactivate the brand',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, deactivate it',
      });

      if (confirm.isConfirmed) {
        await deactivateBrand(brandId);
        toast.success("Brand deactivated successfully");
        fetchBrands();
      }
    } catch (error) {
      toast.error("Error deactivating brand");
    }
  };

  const handleReactivateBrand = async (brandId: number) => {
    try {
      const confirm = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action will reactivate the brand',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, reactivate it',
      });

      if (confirm.isConfirmed) {
        await reactivateBrand(brandId);
        toast.success("Brand reactivated successfully");
        fetchBrands();
      }
    } catch (error) {
      toast.error("Error reactivating brand");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Brands Management</h1>
      <Line />
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default withAdmin( BrandsPage);