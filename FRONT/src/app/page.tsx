"use client";
import React, { useState, useEffect } from 'react';
import { IProductData, IBrandData } from '@/interfaces/data.interfaces';
import { getAllActiveBrands } from '@/services/brandService';
import { fetchActiveProducts } from '@/services/ProductService';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProductPreview from '@/components/ProductPreview';

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
    <main className="container mx-auto px-4 py-8">
  {loading ? (
    <LoadingSpinner />
  ) : error ? (
    <p className="text-center py-10 text-red-500">{error}</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductPreview key={product.id} product={product} />
        ))
      ) : (
        <p className="text-center col-span-3 text-gray-600">No hay productos disponibles.</p>
      )}
    </div>
  )}
</main>
    
/* <main className="m-20 flex min-h-screen flex-col items-center justify-between w-full">
  {loading ? (
    <LoadingSpinner />
  ) : error ? (
    <p className="text-center py-10 text-red-500">{error}</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 w-full">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductPreview key={product.id} product={product} />
        ))
      ) : (
        <p className="text-center col-span-3 text-gray-600">No hay productos disponibles.</p>
      )}
    </div>
  )}
</main> */

  );
}