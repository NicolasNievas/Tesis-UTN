"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IProductData, IBrandData } from '@/interfaces/data.interfaces';
import { getAllActiveBrands } from '@/services/brandService';
import { fetchActiveProducts } from '@/services/ProductService';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [products, setProducts] = useState<IProductData[]>([]);
  const [brands, setBrands] = useState<IBrandData[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const limit = 18;

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([loadProducts(), loadBrands()]);
      } catch (err) {
        setError('Error al cargar los datos. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [skip]);

  const loadProducts = async () => {
    try {
      const data = await fetchActiveProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      throw error;
    }
  };

  const loadBrands = async () => {
    try {
      const data = await getAllActiveBrands();
      setBrands(data);
    } catch (error) {
      console.error('Error loading brands:', error);
      throw error;
    }
  };

  return (
    <main className="m-20 flex min-h-screen flex-col items-center justify-between">
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-center py-10 text-red-500">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="border p-4 rounded-lg shadow-lg bg-white max-w-xs overflow-hidden relative">
                  <div className="h-48 w-full relative">
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-4 py-2 flex items-center justify-between bg-white">
                    <div className="font-bold text-lg mb-1">{product.name}</div>
                    <p className="text-gray-700">${product.price}</p>
                  </div>
                  {/* <p className="text-gray-600 mb-4 px-4">{product.description}</p> */}
                  <Link
                    href={`/product/${product.id}`}
                    className="block text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                  >
                    Ver detalles
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-center col-span-3 text-gray-600">No hay productos disponibles.</p>
            )}
          </div>
        </>
      )}
    </main>
  );
}