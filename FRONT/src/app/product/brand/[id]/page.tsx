"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductPreview from "@/components/ProductPreview";
import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchCategoriesByBrand } from "@/services/brandService";
import { fetchProductByBrand, fetchProductByCategory } from "@/services/ProductService";
import { IProductData, ICategoryData } from "@/interfaces/data.interfaces";

const BrandProductsPage: React.FC = () => {
  const { id } = useParams();
  const [products, setProducts] = useState<IProductData[]>([]);
  const [categories, setCategories] = useState<ICategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchInitialData = async () => {
        try {
          setLoading(true);
          const [productData, categoryData] = await Promise.all([
            fetchProductByBrand(Number(id)),
            fetchCategoriesByBrand(Number(id))
          ]);
          setProducts(productData);
          setCategories(categoryData);
        } catch (err) {
          setError("Error fetching data.");
        } finally {
          setLoading(false);
        }
      };

      fetchInitialData();
    }
  }, [id]);

  useEffect(() => {
    if (selectedCategory !== null) {
      const fetchProductsByCategory = async () => {
        try {
          setLoading(true);
          const data = await fetchProductByCategory(selectedCategory);
          setProducts(data);
        } catch (err) {
          setError("Error fetching products by category.");
        } finally {
          setLoading(false);
        }
      };

      fetchProductsByCategory();
    }
  }, [selectedCategory]);

  return (
    <main className="m-20 flex min-h-screen">
      <aside className="w-1/4 p-4 bg-gray-bg rounded-lg shadow-lg">
        <h2 className="font-bold text-lg mb-4">Categories</h2>
        <ul>
          {categories.map((category) => (
            <li key={category.id} className="mb-2">
              <button
                className="text-black hover:underline w-full text-left p-2 rounded-lg hover:bg-gray-bg-light"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="w-3/4 p-4">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="text-center py-10 text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductPreview key={product.id} product={product} />
              ))
            ) : (
              <p className="text-center col-span-3 text-gray-txt">No hay productos disponibles.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default BrandProductsPage;